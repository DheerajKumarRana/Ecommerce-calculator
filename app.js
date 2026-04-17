document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const costPriceInput = document.getElementById('cost-price');
    const weightInput = document.getElementById('weight');
    const profitMarginInput = document.getElementById('profit-margin');
    const profitMarginSlider = document.getElementById('profit-margin-slider');
    const productGstInput = document.getElementById('product-gst');
    const shopifyFeeInput = document.getElementById('shopify-fee');
    const gatewayFeeInput = document.getElementById('gateway-fee');
    const packagingInput = document.getElementById('packaging');

    // Outputs
    const finalPriceDisplay = document.getElementById('final-price');
    const resCp = document.getElementById('res-cp');
    const resShipping = document.getElementById('res-shipping');
    const resFees = document.getElementById('res-fees');
    const resGst = document.getElementById('res-gst');
    const resProfit = document.getElementById('res-profit');

    const exportBtn = document.getElementById('export-btn');

    function calculateShipping(weightGrams) {
        if (!weightGrams || weightGrams <= 0) return 0;
        
        // Shiprocket Average Rates (Approx)
        // First 500g: ₹55
        // Every additional 500g: +₹45
        const firstSlabLimit = 500;
        const firstSlabRate = 55;
        const addSlabRate = 45;

        let rate = firstSlabRate;
        if (weightGrams > firstSlabLimit) {
            const extraWeight = weightGrams - firstSlabLimit;
            const extraSlabs = Math.ceil(extraWeight / 500);
            rate += extraSlabs * addSlabRate;
        }

        // Add 18% GST on shipping
        return rate * 1.18;
    }

    function calculate() {
        const CP = parseFloat(costPriceInput.value) || 0;
        const W = parseFloat(weightInput.value) || 0;
        const M = (parseFloat(profitMarginInput.value) || 0) / 100;
        const G = (parseFloat(productGstInput.value) || 0) / 100;
        const shopifyRate = (parseFloat(shopifyFeeInput.value) || 0) / 100;
        const gatewayRate = (parseFloat(gatewayFeeInput.value) || 0) / 100;
        const packaging = parseFloat(packagingInput.value) || 0;

        const shipping = calculateShipping(W);
        const CTC = CP + shipping + packaging;

        // Fees Leakage (Platform + Gateway + 18% GST on these fees)
        const feeFactor = (shopifyRate + gatewayRate) * 1.18;

        // GST Liability Factor (Inclusive)
        // If Price is SP, GST part is SP * (G / (1+G))
        const gstFactor = G / (1 + G);

        // Denominator: 1 - Margin - FeesFactor - GstFactor
        const denominator = 1 - M - feeFactor - gstFactor;

        let SP = 0;
        if (denominator > 0) {
            SP = CTC / denominator;
        } else {
            // Handle edge case where margin + fees + taxes > 100%
            SP = 0;
        }

        // Breakdown values for display
        const totalFees = SP * feeFactor;
        const gstLiability = SP * gstFactor;
        const netProfit = SP * M;

        // Update UI
        finalPriceDisplay.textContent = Math.round(SP).toLocaleString('en-IN');
        resCp.textContent = `₹${CP.toLocaleString('en-IN')}`;
        resShipping.textContent = `₹${Math.round(shipping).toLocaleString('en-IN')}`;
        resFees.textContent = `₹${Math.round(totalFees).toLocaleString('en-IN')}`;
        resGst.textContent = `₹${Math.round(gstLiability).toLocaleString('en-IN')}`;
        resProfit.textContent = `₹${Math.round(netProfit).toLocaleString('en-IN')}`;

        // Glow effect if profitable
        if (netProfit > 0) {
            finalPriceDisplay.parentElement.style.color = 'white';
        } else {
            finalPriceDisplay.parentElement.style.color = '#f87171';
        }
    }

    // Sync Slider and Input
    profitMarginSlider.addEventListener('input', (e) => {
        profitMarginInput.value = e.target.value;
        calculate();
    });

    profitMarginInput.addEventListener('input', (e) => {
        profitMarginSlider.value = e.target.value;
        calculate();
    });

    // Event Listeners for all inputs
    [costPriceInput, weightInput, productGstInput, shopifyFeeInput, gatewayFeeInput, packagingInput].forEach(el => {
        el.addEventListener('input', calculate);
    });

    exportBtn.addEventListener('click', () => {
        window.print();
    });

    // Initial Calculation
    calculate();
});
