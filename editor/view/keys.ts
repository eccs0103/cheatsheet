"use strict";

import "adaptive-extender/web";

//#region Keys
export class Keys {
	#map: WeakMap<object, number> = new WeakMap();
	#next: number = 0;

	of(item: object): number {
		const map = this.#map;
		const key = map.get(item);
		if (key !== undefined) return key;
		const next = this.#next++;
		map.set(item, next);
		return next;
	}
}
//#endregion
