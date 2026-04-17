import pandas as pd

def generate_calculator_excel(filename):
    # This script creates an Excel file with the calculator structure and formulas
    
    # Create a writer
    writer = pd.ExcelWriter(filename, engine='xlsxwriter')
    
    # Formats
    workbook = writer.book
    header_format = workbook.add_format({'bold': True, 'bg_color': '#4F46E5', 'font_color': 'white', 'border': 1})
    input_format = workbook.add_format({'bg_color': '#F0F9FF', 'border': 1})
    constant_format = workbook.add_format({'bg_color': '#F8FAFC', 'border': 1})
    result_format = workbook.add_format({'bold': True, 'bg_color': '#4ADE80', 'border': 1})
    percent_format = workbook.add_format({'num_format': '0%', 'border': 1})
    currency_format = workbook.add_format({'num_format': '₹#,##0', 'border': 1})
    
    # Sheet 1: Calculator
    worksheet = workbook.add_worksheet('Strategy Calculator')
    worksheet.set_column('A:A', 30)
    worksheet.set_column('B:B', 20)
    worksheet.set_column('C:C', 5)
    worksheet.set_column('D:D', 30)
    worksheet.set_column('E:E', 20)

    # --- Section 1: User Inputs ---
    worksheet.write('A1', 'USER INPUTS', header_format)
    worksheet.write('B1', 'VALUE', header_format)
    
    worksheet.write('A2', 'Product Cost Price (CP)')
    worksheet.write('B2', 500, input_format)
    
    worksheet.write('A3', 'Product Weight (grams)')
    worksheet.write('B3', 500, input_format)
    
    worksheet.write('A4', 'Target Profit Margin (%)')
    worksheet.write('B4', 0.25, percent_format)

    # --- Section 2: Fixed/Adjustable Constants ---
    worksheet.write('A6', 'PLATFORM & GOVT FEES', header_format)
    worksheet.write('B6', 'VALUE', header_format)
    
    worksheet.write('A7', 'Product GST (%)')
    worksheet.write('B7', 0.12, percent_format)
    
    worksheet.write('A8', 'Shopify Fee (%)')
    worksheet.write('B8', 0.02, percent_format)
    
    worksheet.write('A9', 'Gateway Fee (%)')
    worksheet.write('B9', 0.02, percent_format)
    
    worksheet.write('A10', 'GST on Fees (%)')
    worksheet.write('B10', 0.18, percent_format)
    
    worksheet.write('A11', 'Packaging Cost (₹)')
    worksheet.write('B11', 15, constant_format)

    # --- Section 3: Shiprocket Logistics ---
    worksheet.write('D1', 'LOGISTICS ESTIMATION', header_format)
    worksheet.write('E1', 'VALUE', header_format)
    
    worksheet.write('D2', 'Calculated Base Shipping')
    # Formula: (MAX(1, CEILING(Weight/500)) * 45 + 10)
    worksheet.write_formula('E2', '=(CEILING(B3/500, 1)*45 + 10)', currency_format)
    
    worksheet.write('D3', 'Shipping GST (18%)')
    worksheet.write_formula('E3', '=E2*0.18', currency_format)
    
    worksheet.write('D4', 'Total Shipping Cost')
    worksheet.write_formula('E4', '=E2+E3', currency_format)

    # --- Section 4: Final Recommendation ---
    worksheet.write('D6', 'RECOMMENDED SELLING PRICE', header_format)
    worksheet.write('E6', 'FINAL PRICE', header_format)
    
    # SP = (CP + ShipTotal + Pack) / (1 - Margin - Fees*(1+FeeGST) - GST/(1+GST))
    # B2=CP, E4=ShipTotal, B11=Pack, B4=Margin, B8=Shopify, B9=Gateway, B10=FeeGST, B7=ProdGST
    sp_formula = '=(B2 + E4 + B11) / (1 - B4 - (B8 + B9) * (1 + B10) - (B7 / (1 + B7)))'
    worksheet.write_formula('E7', sp_formula, result_format)
    
    # --- Section 5: Breakdown Table ---
    worksheet.write('A14', 'BREAKDOWN COMPONENT', header_format)
    worksheet.write('B14', 'AMOUNT', header_format)
    
    worksheet.write('A15', 'Cost Price (Base)')
    worksheet.write_formula('B15', '=B2', currency_format)
    
    worksheet.write('A16', 'Total Shipping (Shiprocket)')
    worksheet.write_formula('B16', '=E4', currency_format)
    
    worksheet.write('A17', 'Total Platform Fees')
    worksheet.write_formula('B17', '=E7 * (B8 + B9) * (1 + B10)', currency_format)
    
    worksheet.write('A18', 'GST Liability (Payable)')
    worksheet.write_formula('B18', '=E7 * (B7 / (1 + B7))', currency_format)
    
    worksheet.write('A19', 'Net Profit')
    worksheet.write_formula('B19', '=E7 * B4', currency_format)
    
    worksheet.write('A20', 'Final Selling Price')
    worksheet.write_formula('B20', '=E7', result_format)

    writer.close()
    print(f"Excel file '{filename}' generated successfully.")

if __name__ == "__main__":
    generate_calculator_excel("Ecommerce_Strategy_Calculator.xlsx")
