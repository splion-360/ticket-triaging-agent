from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
from app.exceptions import DatabaseError

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))
    finally:
        db.close()

def get_db_session() -> Session:
    return SessionLocal()