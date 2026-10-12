import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "QuantumCart Customer Service API",
            version: "1.0.0",
            description:
                "API documentation for customer profiles and customer addresses in QuantumCart."
        },

        servers: [
            {
                url: "http://localhost:8007",
                description: "Local development server"
            }
        ],

        tags: [
            {
                name: "Health",
                description: "Service health checks"
            },
            {
                name: "Customers",
                description: "Customer profile management"
            },
            {
                name: "Addresses",
                description: "Customer address management"
            }
        ],

        components: {
            schemas: {
                Customer: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid"
                        },
                        identityUserId: {
                            type: "string",
                            format: "uuid"
                        },
                        firstName: {
                            type: "string"
                        },
                        lastName: {
                            type: "string",
                            nullable: true
                        },
                        status: {
                            type: "string",
                            enum: ["ACTIVE", "BLOCKED", "DELETED"]
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                Address: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid"
                        },
                        customerId: {
                            type: "string",
                            format: "uuid"
                        },
                        addressType: {
                            type: "string",
                            description: "Address type defined by the Address entity"
                        },
                        recipientName: {
                            type: "string"
                        },
                        addressLine1: {
                            type: "string"
                        },
                        addressLine2: {
                            type: "string",
                            nullable: true
                        },
                        city: {
                            type: "string"
                        },
                        state: {
                            type: "string"
                        },
                        postalCode: {
                            type: "string"
                        },
                        country: {
                            type: "string"
                        },
                        phone: {
                            type: "string",
                            nullable: true
                        },
                        isDefault: {
                            type: "boolean"
                        },
                        status: {
                            type: "string"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                CreateCustomerRequest: {
                    type: "object",
                    required: [
                        "identityUserId",
                        "firstName"
                    ],
                    properties: {
                        identityUserId: {
                            type: "string",
                            format: "uuid"
                        },
                        firstName: {
                            type: "string",
                            example: "Akash"
                        },
                        lastName: {
                            type: "string",
                            nullable: true,
                            example: "Kumar"
                        }
                    }
                },

                UpdateCustomerRequest: {
                    type: "object",
                    properties: {
                        firstName: {
                            type: "string"
                        },
                        lastName: {
                            type: "string",
                            nullable: true
                        }
                    }
                },

                UpdateCustomerStatusRequest: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: {
                            type: "string",
                            enum: ["ACTIVE", "BLOCKED", "DELETED"]
                        }
                    }
                },

                CreateAddressRequest: {
                    type: "object",
                    required: [
                        "recipientName",
                        "addressLine1",
                        "city",
                        "state",
                        "postalCode"
                    ],
                    properties: {
                        addressType: {
                            type: "string"
                        },
                        recipientName: {
                            type: "string"
                        },
                        addressLine1: {
                            type: "string"
                        },
                        addressLine2: {
                            type: "string",
                            nullable: true
                        },
                        city: {
                            type: "string"
                        },
                        state: {
                            type: "string"
                        },
                        postalCode: {
                            type: "string"
                        },
                        country: {
                            type: "string",
                            default: "India"
                        },
                        phone: {
                            type: "string",
                            nullable: true
                        },
                        isDefault: {
                            type: "boolean",
                            default: false
                        }
                    }
                },

                UpdateAddressRequest: {
                    type: "object",
                    properties: {
                        addressType: {
                            type: "string"
                        },
                        recipientName: {
                            type: "string"
                        },
                        addressLine1: {
                            type: "string"
                        },
                        addressLine2: {
                            type: "string",
                            nullable: true
                        },
                        city: {
                            type: "string"
                        },
                        state: {
                            type: "string"
                        },
                        postalCode: {
                            type: "string"
                        },
                        country: {
                            type: "string"
                        },
                        phone: {
                            type: "string",
                            nullable: true
                        },
                        isDefault: {
                            type: "boolean"
                        }
                    }
                },

                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        }
                    }
                },

                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false
                        },
                        error: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        },

        paths: {
            "/health": {
                get: {
                    tags: ["Health"],
                    summary: "Check service health",
                    responses: {
                        "200": {
                            description: "Service is healthy",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: {
                                                type: "boolean"
                                            },
                                            service: {
                                                type: "string",
                                                example: "customer-service"
                                            },
                                            status: {
                                                type: "string",
                                                example: "UP"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            "/api/v1/customers": {
                post: {
                    tags: ["Customers"],
                    summary: "Create a customer profile",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CreateCustomerRequest"
                                }
                            }
                        }
                    },
                    responses: {
                        "201": {
                            description: "Customer created",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: {
                                                type: "boolean"
                                            },
                                            data: {
                                                $ref: "#/components/schemas/Customer"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Invalid customer data"
                        },
                        "409": {
                            description: "Customer profile already exists"
                        },
                        "500": {
                            description: "Internal server error"
                        }
                    }
                }
            },

            "/api/v1/customers/by-identity/{identityUserId}": {
                get: {
                    tags: ["Customers"],
                    summary: "Get customer by identity user ID",
                    parameters: [
                        {
                            name: "identityUserId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Customer found",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: {
                                                type: "boolean",
                                                example: true
                                            },
                                            data: {
                                                $ref: "#/components/schemas/Customer"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Invalid identity user ID"
                        },
                        "404": {
                            description: "Customer profile not found"
                        }
                    }
                }
            },

            "/api/v1/customers/{id}": {
                get: {
                    tags: ["Customers"],
                    summary: "Get customer by ID",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Customer found"
                        },
                        "404": {
                            description: "Customer not found"
                        }
                    }
                },

                patch: {
                    tags: ["Customers"],
                    summary: "Update customer profile",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdateCustomerRequest"
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "Customer updated",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: {
                                                type: "boolean",
                                                example: true
                                            },
                                            data: {
                                                $ref: "#/components/schemas/Customer"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Invalid customer data"
                        },
                        "404": {
                            description: "Customer not found"
                        },
                        "409": {
                            description: "Deleted customer cannot be updated"
                        }
                    }
                },

                delete: {
                    tags: ["Customers"],
                    summary: "Soft-delete customer profile",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    responses: {
                        "204": {
                            description: "Customer deleted"
                        },
                        "404": {
                            description: "Customer not found"
                        }
                    }
                }
            },

            "/api/v1/customers/{id}/status": {
                patch: {
                    tags: ["Customers"],
                    summary: "Update customer status",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdateCustomerStatusRequest"
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "Customer status updated"
                        },
                        "400": {
                            description: "Invalid status"
                        },
                        "404": {
                            description: "Customer not found"
                        },
                        "409": {
                            description: "Customer status cannot be changed"
                        }
                    }
                }
            },

            "/api/v1/customers/{customerId}/addresses": {
                post: {
                    tags: ["Addresses"],
                    summary: "Create customer address",
                    parameters: [
                        {
                            name: "customerId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CreateAddressRequest"
                                }
                            }
                        }
                    },
                    responses: {
                        "201": {
                            description: "Address created"
                        },
                        "400": {
                            description: "Invalid address data"
                        },
                        "404": {
                            description: "Customer not found"
                        }
                    }
                },

                get: {
                    tags: ["Addresses"],
                    summary: "List customer addresses",
                    parameters: [
                        {
                            name: "customerId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Address list returned"
                        },
                        "404": {
                            description: "Customer not found"
                        }
                    }
                }
            },

            "/api/v1/customers/{customerId}/addresses/{addressId}": {
                get: {
                    tags: ["Addresses"],
                    summary: "Get customer address",
                    parameters: [
                        {
                            name: "customerId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        },
                        {
                            name: "addressId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Address found"
                        },
                        "404": {
                            description: "Address not found or does not belong to customer"
                        }
                    }
                },

                patch: {
                    tags: ["Addresses"],
                    summary: "Update customer address",
                    parameters: [
                        {
                            name: "customerId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        },
                        {
                            name: "addressId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdateAddressRequest"
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "Address updated"
                        },
                        "400": {
                            description: "Invalid address data"
                        },
                        "404": {
                            description: "Address or customer not found"
                        }
                    }
                },

                delete: {
                    tags: ["Addresses"],
                    summary: "Delete customer address",
                    parameters: [
                        {
                            name: "customerId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        },
                        {
                            name: "addressId",
                            in: "path",
                            required: true,
                            schema: {
                                type: "string",
                                format: "uuid"
                            }
                        }
                    ],
                    responses: {
                        "204": {
                            description: "Address deleted"
                        },
                        "404": {
                            description: "Address or customer not found"
                        }
                    }
                }
            }
        }
    },

    apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;