import pandas as pd

def generate_pro_calculator(filename):
    writer = pd.ExcelWriter(filename, engine='xlsxwriter')
    workbook = writer.book
    
    # Styles
    header_style = workbook.add_format({'bold': True, 'bg_color': '#6366F1', 'font_color': 'white', 'border': 1, 'align': 'center'})
    input_style = workbook.add_format({'bg_color': '#F0F9FF', 'border': 1})
    formula_style = workbook.add_format({'bg_color': '#F8FAFC', 'border': 1, 'num_format': '₹#,##0.00'})
    result_style = workbook.add_format({'bold': True, 'bg_color': '#4ADE80', 'border': 1, 'num_format': '₹#,##0', 'font_size': 14})
    percent_style = workbook.add_format({'num_format': '0.0%', 'border': 1})
    
    ws = workbook.add_worksheet('Pro Unit Economics')
    ws.set_column('A:A', 30)
    ws.set_column('B:B', 15)
    ws.set_column('C:C', 15)
    ws.set_column('D:D', 20)
    
    # --- TABLE HEADERS ---
    ws.write('A1', 'COST COMPONENT', header_style)
    ws.write('B1', 'UNIT (₹/%)', header_style)
    ws.write('C1', 'INPUT VALUE', header_style)
    ws.write('D1', 'EFFECTIVE ₹', header_style)

    # --- INPUT ROWS ---
    rows = [
        ('Raw Material', '₹', 300),
        ('Production', '₹', 50),
        ('Packaging', '₹', 15),
        ('Shipping', '₹', 65),
        ('RTO Risk', '%', 0.05),
        ('Marketing (CAC)', '₹', 150),
        ('Other Costs', '₹', 0),
        ('Profit Goal', '%', 0.20),
        ('Gateway Fees', '%', 0.02),
    ]
    
    start_row = 1
    for i, (name, unit, val) in enumerate(rows):
        row_idx = start_row + i
        ws.write(row_idx, 0, name)
        ws.write(row_idx, 1, unit)
        ws.write(row_idx, 2, val, percent_style if unit == '%' else None)
        # Formula for Effective ₹: IF(Unit == "₹", Val, SP * Val)
        # SP is at E11 (placeholder)
        ws.write_formula(row_idx, 3, f'=IF(B{row_idx+1}="₹", C{row_idx+1}, $E$11 * C{row_idx+1})', formula_style)

    # Constant Inputs
    ws.write('A11', 'Product GST (%)', header_style)
    ws.write('B11', 0.12, percent_style)
    
    ws.write('A12', 'Pricing Strategy', header_style)
    ws.write('B12', 'Inclusive') # Toggle cell
    ws.data_validation('B12', {'validate': 'list', 'source': ['Inclusive', 'Exclusive']})
    
    # --- LOGIC COLUMN (Hidden or side) ---
    ws.write('D11', 'RECOMMENDED MRP', header_style)
    
    # MATH: F = SUM(Fixeds), V = SUM(Percents)
    # F logic: SUMIF(B2:B10, "₹", C2:C10)
    # V logic: SUMIF(B2:B10, "%", C2:C10) + (B10*1.18) -- gateway with tax
    
    fixed_sum_f = 'SUMIF(B2:B10, "₹", C2:C10)'
    percent_sum_f = '(SUMIF(B2:B10, "%", C2:C10) + C10*1.18)'
    gst_factor_f = '(B11/(1+B11))'
    
    # SP = IF(Strategy="Inclusive", F / (1 - V - G), (F / (1 - V)) * (1 + GST))
    final_sp_formula = f'=IF(B12="Inclusive", {fixed_sum_f} / (1 - {percent_sum_f} - {gst_factor_f}), ({fixed_sum_f} / (1 - {percent_sum_f})) * (1 + B11))'
    ws.write_formula('E11', final_sp_formula, result_style)

    # --- P&L SUMMARY ---
    ws.write('A14', 'P&L SUMMARY-PER UNIT', header_style)
    ws.write('B14', 'VALUE', header_style)
    
    summary = [
        ('Gross Selling Price', '=$E$11'),
        ('GST Liability', '=$E$11 * (B11/(1+B11))'),
        ('Net Sales', '=B15-B16'),
        ('Total COGS (RM+Prod+Pack)', '=D2+D3+D4'),
        ('Logistics (Ship+RTO)', '=D5+D6'),
        ('Marketing (CAC)', '=D7'),
        ('Payment Gateway', '=E11 * C10 * 1.18'),
        ('Net Profit (EBITDA)', '=B17 - B18 - B19 - B20 - B21')
    ]
    
    for i, (name, formula) in enumerate(summary):
        row_idx = 14 + i
        ws.write(row_idx, 0, name)
        ws.write_formula(row_idx, 1, formula, formula_style if i < 7 else result_style)

    writer.close()
    print(f"Generated Pro Excellence Excel: {filename}")

if __name__ == "__main__":
    generate_pro_calculator("Ecommerce_Pro_CA_Calculator.xlsx")
