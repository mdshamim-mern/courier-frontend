// For components importing specific schemas directly (e.g., login-form, register-form)
export * from "./auth.validation";
export * from "./courier.validation";
export * from "./shipment.validation";

// For components importing grouped schemas (e.g., forgot-password, create-shipment-form)
export * as AuthValidation from "./auth.validation";
export * as CourierValidation from "./courier.validation";
export * as ShipmentValidation from "./shipment.validation";