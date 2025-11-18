interface TariffsBox {
  dtNextBox: string;
  dtTillMax: string;
  warehouseList: {
      boxDeliveryBase: string;
      boxDeliveryCoefExpr: string;
      boxDeliveryLiter: string;
      boxDeliveryMarketplaceBase: string;
      boxDeliveryMarketplaceCoefExpr: string;
      boxDeliveryMarketplaceLiter: string;
      boxStorageBase: string;
      boxStorageCoefExpr: string;
      boxStorageLiter: string;
      geoName: string;
      warehouseName: string;
  }[];
};

export default TariffsBox;
