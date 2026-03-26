export const createProviderShipment = async ({ provider, order, sellerId }) => {
  if (!provider?.isIntegrated) {
    return null;
  }

  const ts = Date.now().toString().slice(-8);
  const awbNumber = `${provider.code}-${ts}`;
  const baseUrl = provider.webhookUrl || `https://tracking.example.com/${provider.code.toLowerCase()}`;

  return {
    awbNumber,
    trackingUrl: `${baseUrl}?awb=${awbNumber}&order=${order.orderNumber}&seller=${sellerId}`,
  };
};
