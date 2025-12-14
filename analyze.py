#!/usr/bin/env python3
"""InsuranceIQ CLI - AI-powered insurance analysis tool.

Usage:
    python analyze.py --address "123 Main St, Winston-Salem, NC" --dec-page ./sample.pdf
    python analyze.py --address "123 Main St, Winston-Salem, NC" --property-only
    python analyze.py --dec-page ./sample.pdf --parse-only
    python analyze.py --mock-scenario low-liability
"""

import json
import sys
from pathlib import Path

import click
from dotenv import load_dotenv
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table

# Load environment variables
load_dotenv()

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from src.parsers.dec_page import parse_dec_page
from src.research.property import research_property
from src.analysis.gap_analysis import analyze_gaps
from src.models.policy import HomeownersPolicy, Coverage, Deductible, ValuationType
from data.mock_dec_pages import MOCK_SCENARIOS, get_mock_policy

console = Console()


@click.command()
@click.option("--address", "-a", help="Property address to research")
@click.option("--dec-page", "-d", "dec_page_path", type=click.Path(exists=True), help="Path to declaration page PDF/image")
@click.option("--property-only", is_flag=True, help="Only run property research")
@click.option("--parse-only", is_flag=True, help="Only parse dec page, skip analysis")
@click.option("--mock-scenario", "-m", type=click.Choice(list(MOCK_SCENARIOS.keys())), help="Use mock scenario for testing")
@click.option("--net-worth", "-n", type=int, help="Estimated client net worth for analysis")
@click.option("--output", "-o", type=click.Choice(["rich", "json", "markdown"]), default="rich", help="Output format")
def main(address, dec_page_path, property_only, parse_only, mock_scenario, net_worth, output):
    """InsuranceIQ - AI-powered insurance analysis for independent agents."""

    # Validate inputs
    if not any([address, dec_page_path, mock_scenario]):
        console.print("[red]Error: Must provide --address, --dec-page, or --mock-scenario[/red]")
        raise SystemExit(1)

    # === PROPERTY RESEARCH ===
    property_data = None
    if address:
        console.print(Panel(f"[bold blue]Researching Property[/bold blue]\n{address}"))
        try:
            with console.status("[bold green]Searching property databases..."):
                property_data = research_property(address)

            if output == "rich":
                display_property_research(property_data)
            elif output == "json":
                console.print_json(data=property_data.model_dump(mode="json"))
        except Exception as e:
            console.print(f"[red]Property research error: {e}[/red]")
            if property_only:
                raise SystemExit(1)

    if property_only:
        return

    # === DEC PAGE PARSING ===
    policy = None
    if dec_page_path:
        console.print(Panel(f"[bold blue]Parsing Declaration Page[/bold blue]\n{dec_page_path}"))
        try:
            with console.status("[bold green]Analyzing document..."):
                policy = parse_dec_page(dec_page_path)

            if output == "rich":
                display_policy(policy)
            elif output == "json":
                console.print_json(data=policy.model_dump(mode="json"))
        except Exception as e:
            console.print(f"[red]Dec page parsing error: {e}[/red]")
            raise SystemExit(1)

    elif mock_scenario:
        console.print(Panel(f"[bold blue]Using Mock Scenario[/bold blue]\n{mock_scenario}"))
        policy = get_mock_policy(mock_scenario)
        if output == "rich":
            display_policy(policy)

        # Use mock address if not provided
        if not address and policy.property_address:
            address = policy.property_address

    if parse_only:
        return

    # === GAP ANALYSIS ===
    if policy:
        console.print(Panel("[bold blue]Running Gap Analysis[/bold blue]"))

        with console.status("[bold green]Analyzing coverage gaps..."):
            analysis = analyze_gaps(
                policy=policy,
                property_research=property_data,
                net_worth=net_worth,
            )

        if output == "rich":
            display_analysis(analysis)
        elif output == "json":
            console.print_json(data=analysis.to_dict())
        elif output == "markdown":
            console.print(Markdown(analysis.agent_summary))


def display_property_research(data):
    """Display property research results with rich formatting."""
    console.print()

    # Value estimates table
    table = Table(title="Property Value Estimates", show_header=True)
    table.add_column("Source", style="cyan")
    table.add_column("Value", style="green", justify="right")

    if data.value_estimates.zillow:
        table.add_row("Zillow", f"${data.value_estimates.zillow:,}")
    if data.value_estimates.redfin:
        table.add_row("Redfin", f"${data.value_estimates.redfin:,}")
    if data.value_estimates.tax_assessed:
        table.add_row("Tax Assessed", f"${data.value_estimates.tax_assessed:,}")
    if data.last_sale_price:
        table.add_row("Last Sale", f"${data.last_sale_price:,} ({data.last_sale_date})")

    console.print(table)
    console.print()

    # Property details table
    details_table = Table(title="Property Details", show_header=False)
    details_table.add_column("Field", style="cyan")
    details_table.add_column("Value")

    d = data.details
    if d.year_built:
        details_table.add_row("Year Built", str(d.year_built))
    if d.square_footage:
        details_table.add_row("Square Footage", f"{d.square_footage:,} sq ft")
    if d.bedrooms:
        details_table.add_row("Bedrooms", str(d.bedrooms))
    if d.bathrooms:
        details_table.add_row("Bathrooms", str(d.bathrooms))
    if d.construction_type:
        details_table.add_row("Construction", d.construction_type)
    if d.roof_type:
        details_table.add_row("Roof", d.roof_type)
    if d.garage:
        details_table.add_row("Garage", d.garage)

    console.print(details_table)
    console.print()

    # Risk factors
    risk_table = Table(title="Risk Factors", show_header=False)
    risk_table.add_column("Factor", style="cyan")
    risk_table.add_column("Value")

    r = data.risk_factors
    if r.flood_zone:
        color = "red" if r.in_sfha else "green"
        risk_table.add_row("Flood Zone", f"[{color}]{r.flood_zone}[/{color}] - {r.flood_zone_description or ''}")
    if r.fire_protection_class:
        color = "green" if r.fire_protection_class <= 5 else "yellow" if r.fire_protection_class <= 7 else "red"
        risk_table.add_row("Fire Protection Class", f"[{color}]{r.fire_protection_class}[/{color}]")
    if r.has_pool:
        risk_table.add_row("Pool", "[yellow]Yes - Liability exposure[/yellow]")
    if r.coastal_zone:
        risk_table.add_row("Coastal Zone", "[yellow]Yes - Wind exposure[/yellow]")

    console.print(risk_table)
    console.print()

    # Sources
    if data.sources:
        console.print("[bold]Sources:[/bold]")
        for s in data.sources:
            url_part = f" - {s.url}" if s.url else ""
            console.print(f"  • {s.name}{url_part}")
    console.print()


def display_policy(policy):
    """Display parsed policy data with rich formatting."""
    console.print()

    if isinstance(policy, HomeownersPolicy):
        # Header info
        info_table = Table(show_header=False, box=None)
        info_table.add_column("Field", style="cyan")
        info_table.add_column("Value")

        if policy.carrier:
            info_table.add_row("Carrier", policy.carrier)
        if policy.policy_number:
            info_table.add_row("Policy Number", policy.policy_number)
        if policy.insured_name:
            info_table.add_row("Insured", policy.insured_name)
        if policy.property_address:
            info_table.add_row("Property", policy.property_address)
        if policy.effective_date:
            info_table.add_row("Effective", str(policy.effective_date))

        console.print(info_table)
        console.print()

        # Coverages table
        cov_table = Table(title="Coverages", show_header=True)
        cov_table.add_column("Coverage", style="cyan")
        cov_table.add_column("Limit", justify="right")
        cov_table.add_column("Valuation")

        if policy.dwelling and policy.dwelling.limit:
            val = policy.dwelling.valuation.value if policy.dwelling.valuation else "N/A"
            cov_table.add_row("A - Dwelling", f"${policy.dwelling.limit:,}", val)
        if policy.other_structures and policy.other_structures.limit:
            cov_table.add_row("B - Other Structures", f"${policy.other_structures.limit:,}", "")
        if policy.personal_property and policy.personal_property.limit:
            val = policy.personal_property.valuation.value if policy.personal_property.valuation else "N/A"
            cov_table.add_row("C - Personal Property", f"${policy.personal_property.limit:,}", val)
        if policy.loss_of_use and policy.loss_of_use.limit:
            cov_table.add_row("D - Loss of Use", f"${policy.loss_of_use.limit:,}", "")
        if policy.liability and policy.liability.limit:
            cov_table.add_row("E - Liability", f"${policy.liability.limit:,}", "")
        if policy.medical_payments and policy.medical_payments.limit:
            cov_table.add_row("F - Medical Payments", f"${policy.medical_payments.limit:,}", "")

        console.print(cov_table)
        console.print()

        # Deductibles
        if policy.deductibles:
            ded_table = Table(title="Deductibles", show_header=False)
            ded_table.add_column("Type", style="cyan")
            ded_table.add_column("Amount", justify="right")

            if policy.deductibles.all_peril:
                ded_table.add_row("All Peril", f"${policy.deductibles.all_peril:,}")
            if policy.deductibles.wind_hail:
                ded_table.add_row("Wind/Hail", f"${policy.deductibles.wind_hail:,}")
            elif policy.deductibles.wind_hail_percentage:
                ded_table.add_row("Wind/Hail", f"{policy.deductibles.wind_hail_percentage}% of Cov A")

            console.print(ded_table)
            console.print()

        # Endorsements
        if policy.endorsements:
            console.print("[bold]Endorsements:[/bold]")
            for e in policy.endorsements:
                console.print(f"  • {e}")
            console.print()


def display_analysis(analysis):
    """Display gap analysis results with rich formatting."""
    console.print()

    # High priority gaps
    if analysis.high_priority_gaps:
        console.print(Panel("[bold red]🔴 HIGH PRIORITY GAPS[/bold red]", expand=False))
        for gap in analysis.high_priority_gaps:
            console.print(f"\n[bold red]{gap.issue}[/bold red]")
            console.print(f"  Current: {gap.current}")
            console.print(f"  Recommended: [green]{gap.recommended}[/green]")
            console.print(f"  Action: [yellow]{gap.action}[/yellow]")
        console.print()

    # Medium priority gaps
    if analysis.medium_priority_gaps:
        console.print(Panel("[bold yellow]🟡 RECOMMENDATIONS[/bold yellow]", expand=False))
        for gap in analysis.medium_priority_gaps:
            console.print(f"\n[bold yellow]{gap.issue}[/bold yellow]")
            console.print(f"  Current: {gap.current}")
            console.print(f"  Recommended: [green]{gap.recommended}[/green]")
            console.print(f"  Action: {gap.action}")
        console.print()

    # Considerations
    if analysis.considerations:
        console.print(Panel("[bold blue]💬 QUESTIONS FOR CLIENT[/bold blue]", expand=False))
        for c in analysis.considerations:
            console.print(f"\n[bold]{c.question}[/bold]")
            console.print(f"  [dim]{c.why_it_matters}[/dim]")
            if c.if_yes:
                console.print(f"  If yes: [yellow]{c.if_yes}[/yellow]")
        console.print()

    # Recommended coverages
    rec = analysis.recommended_coverages
    if any([rec.dwelling, rec.liability, rec.umbrella, rec.add_endorsements]):
        console.print(Panel("[bold green]📋 RECOMMENDED COVERAGES[/bold green]", expand=False))
        if rec.dwelling:
            console.print(f"  Dwelling: [green]${rec.dwelling:,}[/green]")
        if rec.liability:
            console.print(f"  Liability: [green]${rec.liability:,}[/green]")
        if rec.umbrella:
            console.print(f"  Umbrella: [green]${rec.umbrella:,}[/green]")
        if rec.add_endorsements:
            console.print("  Add endorsements:")
            for e in rec.add_endorsements:
                console.print(f"    • {e}")
        console.print()


if __name__ == "__main__":
    main()
