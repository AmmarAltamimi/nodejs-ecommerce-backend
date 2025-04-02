exports.calculateVariantPricing = (variant) => {
    // Calculate discountPercentage (for permanent discount)    
    if (variant.originalPrice && variant.price) {
      variant.discountPercentage = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);

    } else {
      variant.discountPercentage = 0;
    }
  
    // Calculate salePrice (for time-bound discount)
    
    if (variant.isSale) {

      // If discountType is 'percentage', apply percentage discount; if 'fixed', subtract the fixed discount amount.
      variant.salePrice = variant.discountType === 'percentage' 
        ? variant.price * (1 - variant.discountValue / 100)
        : variant.price - variant.discountValue;
    } 
    // IMPORTANT: Return the modified variant so that .map() can build a new array.
    
    return variant;
  };
  