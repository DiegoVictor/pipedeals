import Opportunity from '../models/Opportunity';
import GetDeal from '../services/GetDeal';
import GetDealProducts from '../services/GetDealProducts';
import UpdateDealFieldsName from '../services/UpdateDealFieldsName';
import CalculateParcels from '../services/CalculateParcels';
import CreateBlingBuyOrder from '../services/CreateBlingBuyOrder';

class PipedriveEventController {
  async store(req, res) {
    const { event, current } = req.body;

    switch (event) {
      case 'updated.deal': {
        if (current.status === 'won') {
          const deal = await UpdateDealFieldsName.run({
            data: await GetDeal.run({ id: current.id }),
          });
          const items = await GetDealProducts.run({ id: deal.id });
          const amount = items.reduce(
            (sum, item) => item.unitary_value * item.quantity + sum,
            0
          );

          await CreateBlingBuyOrder.run({
            opportunity: await Opportunity.create({
              amount,
              supplier: {
                name: deal.supplier,
              },
              client: {
                pipedrive_id: deal.id,
                name: deal.person_id.name,
              },
              payment_method: deal.payment_method,
              parcels: CalculateParcels.run({
                amount,
                parcels_count: deal.parcels,
              }),
              items,
            }),
          });
        }
        break;
      }
    }

    return res.json({
      status: 'success',
    });
  }
}

export default new PipedriveEventController();
