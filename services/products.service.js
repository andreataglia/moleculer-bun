import DbMixin from "../mixins/db.mixin";

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
export const name = "products";
export const mixins = [DbMixin("products")];
export const settings = {
	// Available fields in the responses
	fields: ["_id", "name", "quantity", "price"],

	// Validator for the `create` & `insert` actions.
	entityValidator: {
		name: "string|min:3",
		price: "number|positive",
	},
};
export const hooks = {
	before: {
		/**
		 * Register a before hook for the `create` action.
		 * It sets a default value for the quantity field.
		 *
		 * @param {Context} ctx
		 */
		create(ctx) {
			ctx.params.quantity = 0;
		},
	},
};
export const actions = {
	/**
	 * The "moleculer-db" mixin registers the following actions:
	 *  - list
	 *  - find
	 *  - count
	 *  - create
	 *  - insert
	 *  - update
	 *  - remove
	 */
	// --- ADDITIONAL ACTIONS ---
	/**
	 * Increase the quantity of the product item.
	 */
	increaseQuantity: {
		rest: "PUT /:id/quantity/increase",
		params: {
			id: "string",
			value: "number|integer|positive",
		},
		/** @param {Context} ctx */
		async handler(ctx) {
			const doc = await this.adapter.updateById(ctx.params.id, {
				$inc: { quantity: ctx.params.value },
			});
			const json = await this.transformDocuments(ctx, ctx.params, doc);
			await this.entityChanged("updated", json, ctx);

			return json;
		},
	},

	/**
	 * Decrease the quantity of the product item.
	 */
	decreaseQuantity: {
		rest: "PUT /:id/quantity/decrease",
		params: {
			id: "string",
			value: "number|integer|positive",
		},
		/** @param {Context} ctx  */
		async handler(ctx) {
			const doc = await this.adapter.updateById(ctx.params.id, {
				$inc: { quantity: -ctx.params.value },
			});
			const json = await this.transformDocuments(ctx, ctx.params, doc);
			await this.entityChanged("updated", json, ctx);

			return json;
		},
	},
};
export const methods = {
	/**
	 * Loading sample data to the collection.
	 * It is called in the DB.mixin after the database
	 * connection establishing & the collection is empty.
	 */
	async seedDB() {
		await this.adapter.insertMany([
			{ name: "Samsung Galaxy S10 Plus", quantity: 10, price: 704 },
			{ name: "iPhone 11 Pro", quantity: 25, price: 999 },
			{ name: "Huawei P30 Pro", quantity: 15, price: 679 },
		]);
	},
};
export /**
 * Fired after database connection establishing.
 */
async function afterConnected() {
	// await this.adapter.collection.createIndex({ name: 1 });
}
