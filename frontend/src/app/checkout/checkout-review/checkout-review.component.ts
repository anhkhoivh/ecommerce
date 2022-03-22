import { Component, OnInit, Input } from '@angular/core';
import { BasketService } from 'src/app/basket/basket.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IBasket } from 'src/app/shared/models/basket';
import { CdkStepper } from '@angular/cdk/stepper';
import { Router, NavigationExtras } from '@angular/router';
import { CheckoutService } from '../checkout.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-checkout-review',
  templateUrl: './checkout-review.component.html',
  styleUrls: ['./checkout-review.component.scss']
})
export class CheckoutReviewComponent implements OnInit {
  @Input() appStepper: CdkStepper;
  @Input() checkoutForm: FormGroup;
  basket$: Observable<IBasket>;
  loading = false;

  constructor(
    private basketService: BasketService,
    private toastr: ToastrService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }


  ngOnInit() {
    this.basket$ = this.basketService.basket$;
  }

  createPaymentIntent() {
    return this.basketService.createPaymentIntent()
              .subscribe((response: any) => {
                this.appStepper.next();
              }, error => {
                this.toastr.error(error.message);
              });
  }
  async submitOrder() {
    this.loading = true;
    const basket = this.basketService.getCurrentBasketValue();

    try {
      const createdOrder = await this.createOrder(basket);


        this.basketService.deleteBasket(basket);
        const navigationExtras: NavigationExtras = { state: createdOrder };
        this.router.navigate(['checkout/success'], navigationExtras);


      this.loading = false;
    } catch (error) {
      console.log(error);
      this.loading = false;
    }
  }

  private async createOrder(basket: IBasket) {
    const orderToCreate = this.getOrderToCreate(basket);
    return this.checkoutService.createOrder(orderToCreate).toPromise();
  }

  private getOrderToCreate(basket: IBasket) {
    return {
      basketId: basket.id,
      deliveryMethodId: +this.checkoutForm
        .get('deliveryForm')
        .get('deliveryMethod').value, // for number, + is prefixed
      shipToAddress: this.checkoutForm.get('addressForm').value,
    };
  }
}
