import glob
import os

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from sqlalchemy.orm import Session

from app.agents.nodes import (
    AnalysisState,
    node_classify_tickets,
    node_fetch_tickets,
    node_save_classification,
    node_save_summary,
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
    graph.add_node("save_classification", node_save_classification)
    graph.add_node("save_summary", node_save_summary)

    graph.add_edge("fetch", "classify")
    graph.add_edge("fetch", "summarize")

    graph.add_edge("classify", "save_classification")
    graph.add_edge("summarize", "save_summary")

    graph.add_edge("save_classification", END)
    graph.add_edge("save_summary", END)

    graph.set_entry_point("fetch")

    logger.info("Graph creation COMPLETE!", "GREEN")

    return graph.compile()


async def run_graph(
    db: Session,
    analysis_run_id: str,
    ticket_ids: list = None,
) -> AnalysisRun:
    try:
        logger.info("Starting analysis workflow...", "WHITE")

        analysis_run = AnalysisRun(
            id=analysis_run_id, summary="Analysis in progress..."
        )
        db.add(analysis_run)
        db.commit()
        db.refresh(analysis_run)

        initial_state = AnalysisState(
            analysis_run_id=analysis_run_id,
            ticket_ids=ticket_ids,
            tickets=[],
            results=[],
            summary="",
        )

        graph = create_graph()  # Initialize a LangGraph

        if not glob.glob("assets/*.png"):
            visualize_graph(graph)

        await graph.ainvoke(initial_state)

        analysis_run = (
            db.query(AnalysisRun)
            .filter(AnalysisRun.id == analysis_run_id)
            .first()
        )
        if analysis_run:
            return analysis_run
        else:
            raise AnalysisError("No valid analysis results were produced")

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
