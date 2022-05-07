import { VisitorOrderService } from './services/visitor-order.service';
import { VisitorPurchaseItemsListComponent } from './components/visitor-purchase-items-list/visitor-purchase-items-list.component';
import { VisitorServiceService } from './services/visitor-service.service';
import { VisitorProductAddedComponent } from './components/visitor-product-added/visitor-product-added.component';
import { VisitorVendorService } from './services/visitor-vendor.service';
import { VisitorTrackingComponent } from './components/visitor-tracking/visitor-tracking.component';
import { VisitorServiceFormComponent } from './components/visitor-service-form/visitor-service-form.component';
import { VisitorOrderDetailsComponent } from './components/my-account/visitor-order-details/visitor-order-details.component';
import { VisitorOrdersComponent } from './components/my-account/visitor-orders/visitor-orders.component';
import { VisitorAddressesComponent } from './components/my-account/visitor-addresses/visitor-addresses.component';
import { VisitorChangePasswordComponent } from './components/my-account/visitor-change-password/visitor-change-password.component';
import { VisitorDetailsComponent } from './components/my-account/visitor-details/visitor-details.component';
import { VisitorMyAccountComponent } from './components/my-account/visitor-my-account/visitor-my-account.component';
import { VisitorNewAddressComponent } from './components/address/visitor-new-address/visitor-new-address.component';
import { VisitorAddressBookComponent } from './components/address/visitor-address-book/visitor-address-book.component';
import { VisitorSearchComponent } from './components/visitor-search/visitor-search.component';
import { VisitorVendorProductListResolver } from './resolvers/visitor-vendor-product-list.resolver';
import { VisitorVendorListComponent } from './components/visitor-vendor-list/visitor-vendor-list.component';
import { VisitorProductListResolver } from './resolvers/visitor-produt-list.resolver';
import { VisitorProductService } from './services/visitor-product.service';
import { VisitorProductModalContainerComponent } from './components/visitor-product-modal-container.component';
import { VisitorProductItemComponent } from './components/visitor-product-item/visitor-product-item.component';
import { VisitorProductListComponent } from './components/visitor-product-list/visitor-product-list.component';
import { VisitorGeneralService } from './services/visitor-general.service';
import { VisitorAboutComponent } from './components/visitor-about/visitor-about.component';
import { VisitorContactComponent } from './components/visitor-contact/visitor-contact.component';
import { VisitorHomePageResolver } from './resolvers/visitor-home-page.resolver';
import { VisitorHomeService } from './services/visitor-home.service';
import { VisitorEmailConfirmedComponent } from './components/account/visitor-email-confirmed/visitor-email-confirmed.component';
import { VisitorResetPasswordComponent } from './components/account/visitor-reset-password/visitor-reset-password.component';
import { VisitorForgotPasswordComponent } from './components/account/visitor-forgot-password/visitor-forgot-password.component';
import { VisitorPageNotFoundComponent } from './components/visitor-page-not-found/visitor-page-not-found.component';
import { VisitorLayoutComponent } from './components/visitor-layout/visitor-layout.component';
import { SharedModule } from './../shared/shared.module';
import { VisitorRoutingModule } from './visitor-routing.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VisitorAccountService } from './services/visitor-account.service';
import { VisitorSignInComponent } from './components/account/visitor-sign-in/visitor-sign-in.component';
import { VisitorCreateAccountComponent } from './components/account/visitor-create-account/visitor-create-account.component';
import { VisitorHomeComponent } from './components/visitor-home/visitor-home.component';
import { SocialLoginModule, AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angular5-social-login';
import { OwlModule } from 'ngx-owl-carousel';
import { VisitorVendorDetailsComponent } from './components/visitor-vendor-details/visitor-vendor-details.component';
import { VisitorVendorListResolver } from './resolvers/visitor-vendor-list.resolver';
import { VisitorSearchResolver } from './resolvers/visitor-search.resolver';
import { SafeHtml } from './pipes/SafeHtml';
import { VisitorCartService } from './services/visitor-cart.service';
import { VisitorServiceInfoResolver } from './resolvers/visitor-service-info.resolver';
import { VisitorUserService } from './services/visitor-user.service';
import { CheckoutGuard } from './guards/checkout.guard';
import { Angular4PaystackModule } from 'angular4-paystack';
import { VisitorAddressDetailsComponent } from './components/my-account/visitor-address-details/visitor-address-details.component';
import { VisitorAuthGuard } from './guards/visitor-auth.guard';
import { VisitorCartComponent } from './components/cart-checkout/visitor-cart/visitor-cart.component';
import { VisitorCheckoutComponent } from './components/cart-checkout/visitor-checkout/visitor-checkout.component';
import { VisitorCheckoutCompleteComponent } from './components/cart-checkout/visitor-checkout-complete/visitor-checkout-complete.component';
import { VisitorCheckoutFailedComponent } from './components/cart-checkout/visitor-checkout-failed/visitor-checkout-failed.component';
import { FlutterwaveModule } from 'flutterwave-angular-v3';
import { VisitorTermsAndConditionsComponent } from './components/visitor-terms-and-conditions/visitor-terms-and-conditions.component';

// Configs
export function getAuthServiceConfigs() {
  const config = new AuthServiceConfig(
    [
      {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider('2392032341100534')
      },
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider('781730229447-9qrvoghjk7b0j1rmms25nufffi36paeb.apps.googleusercontent.com')
      },
    ]
  );
  return config;
}

@NgModule({
  imports: [
    VisitorRoutingModule,
    RouterModule,
    SharedModule,
    SocialLoginModule,
    OwlModule,
    Angular4PaystackModule, // .forRoot('pk_test_bdeaa2d769c5e4d1a5449558ace8435fde52f369')
    FlutterwaveModule
  ],
  exports: [
    SharedModule
  ],
  declarations: [
    VisitorLayoutComponent,
    VisitorPageNotFoundComponent,
    VisitorHomeComponent,
    VisitorSignInComponent,
    VisitorCreateAccountComponent,
    VisitorForgotPasswordComponent,
    VisitorResetPasswordComponent,
    VisitorEmailConfirmedComponent,
    VisitorContactComponent,
    VisitorAboutComponent,
    VisitorProductListComponent,
    VisitorProductItemComponent,
    VisitorProductModalContainerComponent,
    VisitorVendorListComponent,
    VisitorVendorDetailsComponent,
    VisitorSearchComponent,
    VisitorCartComponent,
    VisitorCheckoutComponent,
    VisitorAddressBookComponent,
    VisitorNewAddressComponent,
    VisitorMyAccountComponent,
    VisitorDetailsComponent,
    VisitorChangePasswordComponent,
    VisitorAddressesComponent,
    VisitorOrdersComponent,
    VisitorOrderDetailsComponent,
    VisitorServiceFormComponent,
    VisitorTrackingComponent,
    VisitorProductAddedComponent,
    VisitorPurchaseItemsListComponent,
    VisitorAddressDetailsComponent,
    VisitorCheckoutCompleteComponent,
    VisitorCheckoutFailedComponent,
    SafeHtml,
    VisitorTermsAndConditionsComponent
  ],
  entryComponents: [
    VisitorProductItemComponent,
    VisitorAddressBookComponent,
    VisitorNewAddressComponent,
    VisitorProductAddedComponent,
    VisitorPurchaseItemsListComponent
  ],
  providers: [
    VisitorGeneralService,
    VisitorAccountService,
    VisitorHomeService,
    VisitorProductService,
    VisitorVendorService,
    VisitorCartService,
    VisitorServiceService,
    VisitorUserService,
    VisitorOrderService,
    VisitorHomePageResolver,
    VisitorProductListResolver,
    VisitorVendorProductListResolver,
    VisitorVendorListResolver,
    VisitorServiceInfoResolver,
    VisitorSearchResolver,
    CheckoutGuard,
    VisitorAuthGuard,
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    }
  ]
})
export class VisitorModule { }
