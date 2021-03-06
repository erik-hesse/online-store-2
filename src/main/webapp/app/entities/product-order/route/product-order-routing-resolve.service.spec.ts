jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IProductOrder, ProductOrder } from '../product-order.model';
import { ProductOrderService } from '../service/product-order.service';

import { ProductOrderRoutingResolveService } from './product-order-routing-resolve.service';

describe('Service Tests', () => {
  describe('ProductOrder routing resolve service', () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: ProductOrderRoutingResolveService;
    let service: ProductOrderService;
    let resultProductOrder: IProductOrder | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(ProductOrderRoutingResolveService);
      service = TestBed.inject(ProductOrderService);
      resultProductOrder = undefined;
    });

    describe('resolve', () => {
      it('should return IProductOrder returned by find', () => {
        // GIVEN
        service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultProductOrder = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultProductOrder).toEqual({ id: 123 });
      });

      it('should return new IProductOrder if id is not provided', () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultProductOrder = result;
        });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultProductOrder).toEqual(new ProductOrder());
      });

      it('should route to 404 page if data not found in server', () => {
        // GIVEN
        spyOn(service, 'find').and.returnValue(of(new HttpResponse({ body: null })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultProductOrder = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultProductOrder).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
      });
    });
  });
});
