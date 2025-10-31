from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, ForeignKey, Text, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 2), nullable=True)
    city = Column(String(80), nullable=True)
    neighborhood = Column(String(80), nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    area_sqm = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", backref="properties")
    images = relationship(
        "PropertyImage",
        cascade="all, delete-orphan",
        back_populates="property",
        order_by="PropertyImage.sort_order",
    )

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_properties_price_nonneg"),
        CheckConstraint("bedrooms >= 0", name="ck_properties_bedrooms_nonneg"),
        CheckConstraint("bathrooms >= 0", name="ck_properties_bathrooms_nonneg"),
        CheckConstraint("area_sqm >= 0", name="ck_properties_area_nonneg"),
        Index("ix_properties_search", "city", "neighborhood"),
    )

class PropertyImage(Base):
    __tablename__ = "property_images"
    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    is_cover = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)
    property = relationship("Property", back_populates="images")

class Doc(Base):
    __tablename__ = "docs"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)

class DocChunk(Base):
    __tablename__ = "doc_chunks"
    id = Column(Integer, primary_key=True)
    doc_id = Column(Integer, ForeignKey("docs.id", ondelete="CASCADE"))
    ord = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    embedding = Column(Vector(1536), nullable=False)

Index("ix_properties_title", Property.title)
Index("ix_properties_city", Property.city)
Index("ix_properties_neighborhood", Property.neighborhood)
Index("ix_properties_owner_id", Property.owner_id)