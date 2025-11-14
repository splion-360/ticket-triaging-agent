import os

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from sqlalchemy.orm import Session

from app.agents.nodes import (
    AnalysisState,
    node_classify_tickets,
    node_fetch_tickets,
    node_save_results,
    node_summarize_tickets,
)
from app.config import setup_logger
from app.exceptions import AnalysisError
from app.models import AnalysisRun


logger = setup_logger(__name__)


def create_graph():
    logger.info("Graph creation START!", "BLUE")
    graph = StateGraph(AnalysisState)

    graph.add_node("fetch", node_fetch_tickets)
    graph.add_node("classify", node_classify_tickets)
    graph.add_node("summarize", node_summarize_tickets)
    graph.add_node("save", node_save_results)

    graph.add_edge("fetch", "classify")
    graph.add_edge("fetch", "summarize")
    graph.add_edge("classify", "save")
    graph.add_edge("summarize", "save")
    graph.add_edge("save", END)

    graph.set_entry_point("fetch")
    logger.info("Graph creation COMPLETE!", "GREEN")

    return graph.compile()


async def run_graph(db: Session, ticket_ids: list = None) -> AnalysisRun:
    try:
        logger.info("Analysis in progress...", "WHITE")
        analysis_run = AnalysisRun(summary="Analysis in progress...")
        db.add(analysis_run)
        db.commit()
        db.refresh(analysis_run)

        initial_state = AnalysisState(
            analysis_run_id=analysis_run.id,
            tickets=[],
            results=[],
            summary="",
        )

        graph = create_graph()

        if not os.path.exists("backend/assets") or not os.listdir(
            "backend/assets"
        ):
            visualize_graph(graph)

        await graph.ainvoke(initial_state)

        db.refresh(analysis_run)
        return analysis_run

    except Exception as e:
        logger.error(e)
        db.rollback()
        raise AnalysisError(f"Analysis graph failed: {str(e)}") from e


def visualize_graph(app: CompiledStateGraph, save_dir: str = "assets/"):
    try:
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        logger.info(f"Creating state graph for {app}")
        file_path = os.path.join(save_dir, "workflow_graph.png")

        app.get_graph().draw_mermaid_png(output_file_path=file_path)
        logger.info(f"Image succesfully saved at {file_path}")

    except Exception as e:
        logger.warning(f"Unable to process the graph {app} @ {save_dir}: {e}")
        return
