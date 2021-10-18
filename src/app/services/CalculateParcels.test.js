const CalculateParcels = require("./CalculateParcels")
// @ponicode
describe("run", () => {
    let inst

    beforeEach(() => {
        inst = new CalculateParcels.default()
    })

    test("0", () => {
        let callFunction = () => {
            inst.run({ amount: -10, parcels_count: 0 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.run({ amount: -1, parcels_count: 10 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.run({ amount: 1, parcels_count: 1.0 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.run({ amount: 0.0, parcels_count: 0.5 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst.run({ amount: -1, parcels_count: 1 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.run({ amount: Infinity, parcels_count: Infinity })
        }
    
        expect(callFunction).not.toThrow()
    })
})
