from langgraph.graph import StateGraph, END
from sqlalchemy.orm import Session

from app.agents.nodes import AnalysisState, fetch_tickets_node, analyze_tickets_node, save_results_node
from app.models import AnalysisRun
from app.exceptions import AnalysisError

def create_analysis_workflow():
    workflow = StateGraph(AnalysisState)
    
    workflow.add_node("fetch", fetch_tickets_node)
    workflow.add_node("analyze", analyze_tickets_node)
    workflow.add_node("save", save_results_node)
    
    workflow.add_edge("fetch", "analyze")
    workflow.add_edge("analyze", "save")
    workflow.add_edge("save", END)
    
    workflow.set_entry_point("fetch")
    
    return workflow.compile()

def run_ticket_analysis(db: Session, ticket_ids: list = None) -> AnalysisRun:
    try:
        analysis_run = AnalysisRun(summary="Analysis in progress...")
        db.add(analysis_run)
        db.commit()
        db.refresh(analysis_run)
        
        initial_state = AnalysisState(
            analysis_run_id=analysis_run.id,
            tickets=[],
            individual_results=[],
            batch_summary=""
        )
        
        workflow = create_analysis_workflow()
        final_state = workflow.invoke(initial_state)
        
        db.refresh(analysis_run)
        return analysis_run
        
    except Exception as e:
        db.rollback()
        raise AnalysisError(f"Analysis workflow failed: {str(e)}")