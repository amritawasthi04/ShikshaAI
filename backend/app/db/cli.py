"""Command-line interface for Database Management operations."""
import argparse
import asyncio
import json
import logging
import sys
from app.db.manager import DatabaseManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


async def cmd_init(args: argparse.Namespace) -> None:
    res = await DatabaseManager.init_all()
    print("\n--- DATABASE INITIALIZATION REPORT ---")
    print(json.dumps(res, indent=2))


async def cmd_check(args: argparse.Namespace) -> None:
    res = await DatabaseManager.check_health()
    print("\n--- DATABASE HEALTH REPORT ---")
    print(json.dumps(res, indent=2))
    if res.get("status") != "healthy":
        sys.exit(1)


async def cmd_seed(args: argparse.Namespace) -> None:
    res = await DatabaseManager.seed()
    print("\n--- DATABASE SEED REPORT ---")
    print(json.dumps(res, indent=2))


async def cmd_migrate(args: argparse.Namespace) -> None:
    res = await DatabaseManager.migrate_to_chroma()
    print("\n--- CHROMA CLOUD MIGRATION REPORT ---")
    print(json.dumps(res, indent=2))


async def cmd_stats(args: argparse.Namespace) -> None:
    res = await DatabaseManager.get_stats()
    print("\n--- DATABASE STATISTICS ---")
    print(json.dumps(res, indent=2))


async def cmd_audit(args: argparse.Namespace) -> None:
    res = await DatabaseManager.audit()
    print("\n--- DATABASE INTEGRITY AUDIT ---")
    print(json.dumps(res, indent=2))


async def cmd_telemetry(args: argparse.Namespace) -> None:
    res = await DatabaseManager.telemetry()
    print("\n--- DATABASE TELEMETRY ---")
    print(json.dumps(res, indent=2))


async def cmd_export(args: argparse.Namespace) -> None:
    res = await DatabaseManager.export_learner(args.learner_id)
    print(f"\n--- COMPLIANCE EXPORT FOR {args.learner_id} ---")
    print(json.dumps(res, indent=2, default=str))


async def cmd_backup(args: argparse.Namespace) -> None:
    res = await DatabaseManager.create_backup()
    out_file = args.output or "database_backup.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2, default=str)
    print(f"\n--- BACKUP CREATED SUCCESSFULLY: {out_file} ---")
    print(f"Core collections: {len(res.get('core', {}))}, Chat collections: {len(res.get('chat', {}))}")


def main() -> None:
    parser = argparse.ArgumentParser(description="PathAI (Shiksha) Database Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: init
    subparsers.add_parser("init", help="Initialize collections, indexes, and Chroma schemas")

    # Subcommand: check
    subparsers.add_parser("check", help="Perform health check on MongoDB Atlas and Chroma Cloud")

    # Subcommand: seed
    subparsers.add_parser("seed", help="Seed initial skills and taxonomy data")

    # Subcommand: migrate
    subparsers.add_parser("migrate", help="Migrate MongoDB documents into Chroma Cloud")

    # Subcommand: stats
    subparsers.add_parser("stats", help="Display document counts and collection statistics")

    # Subcommand: audit
    subparsers.add_parser("audit", help="Audit database integrity for orphaned records")

    # Subcommand: telemetry
    subparsers.add_parser("telemetry", help="Display live database latency and volume telemetry")

    # Subcommand: export
    export_parser = subparsers.add_parser("export", help="Export compliance bundle for a learner")
    export_parser.add_argument("learner_id", help="Learner ID to export")

    # Subcommand: backup
    backup_parser = subparsers.add_parser("backup", help="Create a JSON backup snapshot")
    backup_parser.add_argument("--output", "-o", default="database_backup.json", help="Output file path")

    args = parser.parse_args()

    handlers = {
        "init": cmd_init,
        "check": cmd_check,
        "seed": cmd_seed,
        "migrate": cmd_migrate,
        "stats": cmd_stats,
        "audit": cmd_audit,
        "telemetry": cmd_telemetry,
        "export": cmd_export,
        "backup": cmd_backup,
    }

    asyncio.run(handlers[args.command](args))


if __name__ == "__main__":
    main()

