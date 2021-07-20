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
          const updateDealFieldsName = new UpdateDealFieldsName();
          const getDeal = new GetDeal();

          const deal = await updateDealFieldsName.run({
            data: await getDeal.run({ id: current.id }),
          });

          const getDealProducts = new GetDealProducts();
          const items = await getDealProducts.run({ id: deal.id });
          const amount = items.reduce(
            (sum, item) => item.unitary_value * item.quantity + sum,
            0
          );

          const calculateParcels = new CalculateParcels();
          const createBlingBuyOrder = new CreateBlingBuyOrder();
          await createBlingBuyOrder.run({
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
              parcels: calculateParcels.run({
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

export default PipedriveEventController;
