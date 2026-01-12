from sqlalchemy import (
    Column, DateTime, Integer, String, Numeric, Boolean, ForeignKey, Text,
    Index, CheckConstraint, UniqueConstraint, text
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
    phone = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="owner")
class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    is_for_sale = Column(Boolean, nullable=False, default=True)
    is_for_rent = Column(Boolean, nullable=False, default=False)
    price = Column(Numeric(12, 2), nullable=True)       
    rent_price = Column(Numeric(12, 2), nullable=True) 
    description = Column(Text, nullable=True)
    city = Column(String(80), nullable=True)
    neighborhood = Column(String(80), nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    area_sqm = Column(Integer, nullable=True)
    property_type = Column(String(50), nullable=True)
    furnished = Column(Boolean, default=False, nullable=False)
    floor = Column(Integer, nullable=True)
    building_age = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    owner = relationship("User", back_populates="properties")
    images = relationship(
        "PropertyImage",
        cascade="all, delete-orphan",
        back_populates="property",
        order_by="PropertyImage.sort_order",
    )
    favorited_by = relationship(
        "Favorite",
        back_populates="property",
        cascade="all, delete-orphan",
    )
    __table_args__ = (
        CheckConstraint("price IS NULL OR price >= 0", name="ck_properties_price_nonneg"),
        CheckConstraint("rent_price IS NULL OR rent_price >= 0", name="ck_properties_rent_price_nonneg"),
        CheckConstraint("bedrooms IS NULL OR bedrooms >= 0", name="ck_properties_bedrooms_nonneg"),
        CheckConstraint("bathrooms IS NULL OR bathrooms >= 0", name="ck_properties_bathrooms_nonneg"),
        CheckConstraint("area_sqm IS NULL OR area_sqm >= 0", name="ck_properties_area_nonneg"),
        CheckConstraint("(is_for_sale OR is_for_rent)", name="ck_properties_any_offer"),
        CheckConstraint("(NOT is_for_sale) OR price IS NOT NULL", name="ck_properties_sale_has_price"),
        CheckConstraint("(NOT is_for_rent) OR rent_price IS NOT NULL", name="ck_properties_rent_has_price"),
        Index("ix_properties_search", "city", "neighborhood"),
        Index("ix_properties_sale_rent", "is_for_sale", "is_for_rent"),
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
class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorited_by")
    __table_args__ = (
        UniqueConstraint("user_id", "property_id", name="uq_favorites_user_property"),
        Index("ix_favorites_user", "user_id"),
        Index("ix_favorites_property", "property_id"),
    )

Index("ix_properties_title", Property.title)
Index("ix_properties_city", Property.city)
Index("ix_properties_neighborhood", Property.neighborhood)
Index("ix_properties_owner_id", Property.owner_id)