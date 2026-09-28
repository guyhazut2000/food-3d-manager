"""Seeds a starter catalog with placeholder prices. Run with: python -m app.products.seed

Prices here are illustrative, marked with source="seed"; the scheduled scraper will record real ones.
"""

import asyncio
import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.core.db import SessionLocal
from app.products.models import Product
from app.products.pricing import Price
from app.products.service import record_price

SOURCE = "seed"
HISTORY_DAYS_AGO = (84, 70, 56, 42, 28, 14)

# (name, unit, typical price in agorot, package, color)
CATALOG: dict[str, list[tuple[str, str, int, str, str]]] = {
    "produce": [
        ("Bananas", "1 kg", 790, "bunch", "#facc15"),
        ("Gala apples", "1 kg", 1190, "round", "#dc2626"),
        ("Tomatoes", "1 kg", 890, "round", "#ef4444"),
        ("Cucumbers", "1 kg", 690, "long", "#15803d"),
        ("Potatoes", "1 kg", 590, "round", "#a16207"),
        ("Onions", "1 kg", 490, "round", "#d6a15c"),
        ("Carrots", "1 kg", 490, "long", "#f97316"),
        ("Lemons", "1 kg", 890, "round", "#fde047"),
        ("Avocado", "each", 590, "round", "#3f6212"),
        ("Red peppers", "1 kg", 1490, "round", "#b91c1c"),
        ("Lettuce", "each", 690, "round", "#84cc16"),
        ("Oranges", "1 kg", 790, "round", "#fb923c"),
        ("Strawberries", "250 g", 1290, "tray", "#e11d48"),
        ("Garlic", "3 heads", 790, "round", "#f5f5f4"),
        ("Sweet potatoes", "1 kg", 990, "long", "#c2410c"),
    ],
    "dairy": [
        ("Milk 3%", "1 L", 690, "carton", "#2563eb"),
        ("Cottage cheese", "250 g", 590, "tub", "#0ea5e9"),
        ("Yellow cheese", "200 g", 1790, "block", "#facc15"),
        ("Butter", "200 g", 1190, "block", "#fef08a"),
        ("Greek yogurt", "500 g", 1290, "tub", "#1e3a8a"),
        ("Eggs (L)", "12 pack", 1390, "egg_carton", "#fef3c7"),
        ("Cream cheese", "250 g", 890, "tub", "#e0f2fe"),
        ("Sour cream", "200 ml", 490, "cup", "#16a34a"),
        ("Labneh", "250 g", 790, "tub", "#f8fafc"),
        ("Mozzarella", "200 g", 1490, "block", "#f1f5f9"),
        ("Chocolate milk", "1 L", 890, "carton", "#78350f"),
        ("Whipping cream", "250 ml", 790, "carton", "#7c3aed"),
        ("Feta cheese", "250 g", 1590, "block", "#f5f5f4"),
        ("Plain yogurt", "4 × 200 g", 1190, "cup", "#38bdf8"),
        ("Parmesan", "100 g", 1990, "block", "#fcd34d"),
    ],
    "bakery": [
        ("White bread", "750 g", 790, "loaf", "#e7c79a"),
        ("Whole wheat bread", "750 g", 1090, "loaf", "#92400e"),
        ("Challah", "500 g", 1290, "loaf", "#d97706"),
        ("Pita", "10 pack", 890, "bag", "#f5deb3"),
        ("Bagels", "4 pack", 1490, "bag", "#c08a4a"),
        ("Croissants", "4 pack", 1990, "box", "#f59e0b"),
        ("Tortillas", "8 pack", 1490, "bag", "#fde68a"),
        ("Rye bread", "750 g", 1390, "loaf", "#57331b"),
        ("Burger buns", "6 pack", 990, "bag", "#e0a458"),
        ("Rugelach", "400 g", 2490, "box", "#7c2d12"),
        ("Baguette", "each", 890, "long", "#d4a056"),
        ("Sourdough loaf", "800 g", 2290, "loaf", "#b7793e"),
        ("Muffins", "4 pack", 2190, "box", "#db2777"),
        ("Cinnamon rolls", "4 pack", 2490, "box", "#b45309"),
        ("Crackers", "200 g", 890, "box", "#dc2626"),
    ],
    "pantry": [
        ("Pasta", "500 g", 590, "bag", "#1d4ed8"),
        ("Rice", "1 kg", 990, "bag", "#f8fafc"),
        ("Olive oil", "750 ml", 3990, "bottle", "#4d7c0f"),
        ("Canned tuna", "4 × 160 g", 2890, "can", "#0369a1"),
        ("Hummus", "400 g", 990, "tub", "#ca8a04"),
        ("Tahini", "500 g", 1690, "jar", "#a8773f"),
        ("Ground coffee", "200 g", 2690, "bag", "#3f2a1d"),
        ("Tea", "25 bags", 1190, "box", "#b91c1c"),
        ("Sugar", "1 kg", 590, "bag", "#e2e8f0"),
        ("Flour", "1 kg", 690, "bag", "#fef9c3"),
        ("Cornflakes", "500 g", 1790, "box", "#ea580c"),
        ("Peanut butter", "350 g", 1590, "jar", "#b45309"),
        ("Chickpeas", "400 g can", 490, "can", "#ca8a04"),
        ("Tomato paste", "100 g", 290, "can", "#dc2626"),
        ("Honey", "500 g", 3290, "jar", "#f59e0b"),
    ],
}


def _round_to_ten(agorot: float) -> int:
    return max(10, round(agorot / 10) * 10)


def current_price(index: int, typical: int) -> Price:
    """Every 5th product is on sale (20% off); every 7th has a "2 for 150%" deal."""
    sale = _round_to_ten(typical * 0.8) if index % 5 == 2 else None
    has_deal = index % 7 == 3
    return Price(
        regular=typical,
        sale=sale,
        deal_quantity=2 if has_deal else None,
        deal_price=_round_to_ten(typical * 1.5) if has_deal else None,
    )


def past_prices(name: str, typical: int) -> list[Price]:
    rng = random.Random(name)  # deterministic per product, so reseeding gives the same history
    return [Price(regular=_round_to_ten(typical * rng.uniform(0.92, 1.12))) for _ in HISTORY_DAYS_AGO]


async def seed() -> None:
    """Creates missing catalog products (with price history) and syncs name-keyed details of existing ones."""
    async with SessionLocal() as db:
        existing = {product.name: product for product in await db.scalars(select(Product))}
        now = datetime.now(UTC)
        created = 0

        for category, items in CATALOG.items():
            for index, (name, unit, typical, package, color) in enumerate(items):
                product = existing.get(name)
                if product is not None:
                    product.category, product.unit, product.package, product.color = category, unit, package, color
                    continue

                product = Product(name=name, category=category, unit=unit, package=package, color=color)
                db.add(product)
                await db.flush()
                for days_ago, price in zip(HISTORY_DAYS_AGO, past_prices(name, typical)):
                    await record_price(db, product.id, price, SOURCE, now - timedelta(days=days_ago))
                await record_price(db, product.id, current_price(index, typical), SOURCE, now)
                created += 1

        await db.commit()
        print(f"Catalog seeded: {created} created, {len(existing)} synced.")


if __name__ == "__main__":
    asyncio.run(seed())
