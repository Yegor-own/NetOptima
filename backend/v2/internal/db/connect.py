from sqlalchemy import create_engine, URL
import os
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DATABASE_URL = "postgresql://root:password@localhost:5432/network_design"

load_dotenv()
DATABASE_URL = URL.create(
    drivername=os.getenv("DB_DRIVER", "postgresql"),
    username=os.getenv("DB_USER", os.getenv("POSTGRES_USER", "root")),
    password=os.getenv("DB_PASSWORD", os.getenv("POSTGRES_PASSWORD", "password")),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", 5432)),
    database=os.getenv("DB_NAME", os.getenv("POSTGRES_DB", "network_design")),
)

engine = create_engine(DATABASE_URL, echo=True, plugins=["geoalchemy2"])

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()