document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Inputs Registry
    const inputs = [
        'raw-material', 'production', 'packaging', 
        'shipping', 'rto-cost', 'cac', 'other-costs', 
        'profit-goal'
    ];

    // Persist Mode (fixed vs percent)
    let currentStrategy = 'inclusive'; // inclusive or exclusive
    
    const modes = {
        'raw-material': 'fixed',
        'production': 'fixed',
        'packaging': 'fixed',
        'shipping': 'fixed',
        'rto-cost': 'percent',
        'cac': 'fixed',
        'other-costs': 'fixed',
        'profit-goal': 'percent'
    };

    // Constant % Inputs
    const gatewayFeeInput = document.getElementById('gateway-fee');
    const productGstInput = document.getElementById('product-gst');

    // Display Elements
    const finalPriceDisplay = document.getElementById('final-price');
    const resNetSales = document.getElementById('res-net-sales');
    const resCogs = document.getElementById('res-cogs');
    const resProfit = document.getElementById('res-profit');

    const shareCogs = document.getElementById('share-cogs');
    const valCogs = document.getElementById('val-cogs');
    const shareShipping = document.getElementById('share-shipping');
    const valShipping = document.getElementById('val-shipping');
    const shareCac = document.getElementById('share-cac');
    const valCac = document.getElementById('val-cac');
    const shareTax = document.getElementById('share-tax');
    const valTax = document.getElementById('val-tax');
    const shareProfit = document.getElementById('share-profit');

    function calculate() {
        let fixedSum = 0;
        let percentSum = 0;
        
        // 1. Summarize all inputs based on their mode
        inputs.forEach(id => {
            const val = parseFloat(document.getElementById(id).value) || 0;
            if (modes[id] === 'fixed') {
                fixedSum += val;
            } else {
                percentSum += (val / 100);
            }
        });

        // 2. Add Constant % Fees
        const gatewayRate = (parseFloat(gatewayFeeInput.value) || 0) / 100;
        const gatewayWithGst = gatewayRate * 1.18; // Gateway + 18% GST on that fee
        percentSum += gatewayWithGst;

        // 3. GST Strategy Branching
        const gstRate = (parseFloat(productGstInput.value) || 0) / 100;
        let SP = 0;
        let valGstLiability = 0;

        if (currentStrategy === 'inclusive') {
            const gstFactor = gstRate / (1 + gstRate);
            const denominator = 1 - percentSum - gstFactor;
            if (denominator > 0) {
                SP = fixedSum / denominator;
            }
            valGstLiability = SP * gstFactor;
        } else {
            const denominator = 1 - percentSum;
            if (denominator > 0) {
                const spBase = fixedSum / denominator;
                SP = spBase * (1 + gstRate);
                valGstLiability = SP - spBase;
            }
        }

        // 4. Calculate Absolute Shares for Breakdown
        const getVal = (id) => {
            const v = parseFloat(document.getElementById(id).value) || 0;
            return modes[id] === 'fixed' ? v : SP * (v / 100);
        };

        const valRM = getVal('raw-material');
        const valProd = getVal('production');
        const valPack = getVal('packaging');
        const valCOGS = valRM + valProd + valPack;

        const valShip = getVal('shipping');
        const valRTO = getVal('rto-cost');
        const valLogistics = valShip + valRTO;

        const valCAC = getVal('cac');
        const valOther = getVal('other-costs');
        
        const valGateway = SP * gatewayWithGst;
        const valTotalTaxFees = valGateway + valGstLiability;

        // 5. Update UI
        finalPriceDisplay.textContent = Math.round(SP).toLocaleString('en-IN');
        resNetSales.textContent = `₹${Math.round(SP - valGstLiability).toLocaleString('en-IN')}`;
        resCogs.textContent = `₹${Math.round(valCOGS).toLocaleString('en-IN')}`;
        resProfit.textContent = `₹${Math.round(valCOGS > 0 ? (SP - valGstLiability - valCOGS - valLogistics - valCAC - valOther - valGateway) : 0).toLocaleString('en-IN')}`;

        valCogs.textContent = `₹${Math.round(valCOGS).toLocaleString('en-IN')}`;
        shareCogs.textContent = `${Math.round((valCOGS / SP) * 100 || 0)}%`;

        valShipping.textContent = `₹${Math.round(valLogistics).toLocaleString('en-IN')}`;
        shareShipping.textContent = `${Math.round((valLogistics / SP) * 100 || 0)}%`;

        valCac.textContent = `₹${Math.round(valCAC).toLocaleString('en-IN')}`;
        shareCac.textContent = `${Math.round((valCAC / SP) * 100 || 0)}%`;

        valTax.textContent = `₹${Math.round(valTotalTaxFees).toLocaleString('en-IN')}`;
        shareTax.textContent = `${Math.round((valTotalTaxFees / SP) * 100 || 0)}%`;

        shareProfit.textContent = `${Math.round(((SP - valGstLiability - valCOGS - valLogistics - valCAC - valOther - valGateway) / SP) * 100 || 0)}%`;
    }

    // Event Listeners
    document.querySelectorAll('#gst-strategy button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentStrategy = e.currentTarget.getAttribute('data-strategy');
            document.querySelectorAll('#gst-strategy button').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            calculate();
        });
    });

    document.querySelectorAll('.toggle-group button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.parentElement;
            const inputId = group.getAttribute('data-for');
            modes[inputId] = e.target.getAttribute('data-type');
            group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            calculate();
        });
    });

    // Input Listeners
    [...inputs, 'gateway-fee', 'product-gst'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculate);
    });

    document.getElementById('export-btn').addEventListener('click', () => window.print());

    // Initial Run
    calculate();
});
