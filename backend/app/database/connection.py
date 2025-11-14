from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.exceptions import DatabaseError


engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session | None]:
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e)) from e
    finally:
        db.close()


def get_db_session() -> Session:
    return SessionLocal()
