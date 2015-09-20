// selectService.spec.js
describe('select service for typeahead dropdonw', function() {

    var SelectService,
        rootScope;

    beforeEach(module('pdTypeahead'));

    beforeEach(inject(function($injector) {
        SelectService = $injector.get('pdTypeaheadSelectService');
        SelectService.setSelected(1);
        SelectService.setMax(5);
    }));

    beforeEach(inject(function($injector) {
        rootScope = $injector.get('$rootScope');
        spyOn(rootScope, '$broadcast');
    }));

    it('Should set selected index', function() {
        expect(SelectService.getSelected()).toBe(1);
    });

    it('Should move upwards (dec. index)', function() {
        SelectService.setSelected(3);
        SelectService.moveUp();
        SelectService.moveUp();
        expect(SelectService.getSelected()).toBe(1);
    });

    it('Should move downwards (inc. index)', function() {
        SelectService.moveDown();
        SelectService.moveDown();
        expect(SelectService.getSelected()).toBe(3);
    });

    it('Should limit index (0 and max)', function() {
        SelectService.setSelected(4);
        SelectService.moveDown();
        expect(SelectService.getSelected()).toBe(4);
        SelectService.setSelected(0);
        SelectService.moveUp();
        expect(SelectService.getSelected()).toBe(0);
    });

    it('Should broadcast events', function() {
        //moveup, movedown and applySelection are broadcasting events

        SelectService.moveDown();
        expect(rootScope.$broadcast).toHaveBeenCalledWith('pd.typeahead:updatedIndex', 2);
        
        SelectService.moveUp();
        expect(rootScope.$broadcast).toHaveBeenCalledWith('pd.typeahead:updatedIndex', 1);

        SelectService.applySelection();
        expect(rootScope.$broadcast).toHaveBeenCalledWith('pd.typeahead:applySelection', 1);
    });
});