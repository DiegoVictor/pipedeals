class CalculateParcels {
  run({ amount, parcels_count }) {
    const parcels = [];

    let value = amount / parcels_count;
    if (parcels_count > 1) {
      const rest = parseFloat(Number(amount % parcels_count).toFixed(2));

      if (rest > 0) {
        amount -= rest;
        value = amount / parcels_count + rest;
      }
    }

    parcels.push({
      payment_term_in_days: 30,
      value,
    });

    if (parcels_count > 1) {
      for (let i = 2; i <= parcels_count; i += 1) {
        parcels.push({
          payment_term_in_days: 30 * i,
          value: amount / parcels_count,
        });
      }
    }

    return parcels;
  }
}

export default CalculateParcels;
