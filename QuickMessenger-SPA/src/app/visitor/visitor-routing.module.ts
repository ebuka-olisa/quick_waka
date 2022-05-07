import { VisitorTermsAndConditionsComponent } from './components/visitor-terms-and-conditions/visitor-terms-and-conditions.component';
import { VisitorCheckoutFailedComponent } from './components/cart-checkout/visitor-checkout-failed/visitor-checkout-failed.component';
import { VisitorServiceFormComponent } from './components/visitor-service-form/visitor-service-form.component';
import { VisitorChangePasswordComponent } from './components/my-account/visitor-change-password/visitor-change-password.component';
import { VisitorMyAccountComponent } from './components/my-account/visitor-my-account/visitor-my-account.component';
import { VisitorDetailsComponent } from './components/my-account/visitor-details/visitor-details.component';
import { VisitorAboutComponent } from './components/visitor-about/visitor-about.component';
import { VisitorContactComponent } from './components/visitor-contact/visitor-contact.component';
import { VisitorHomePageResolver } from './resolvers/visitor-home-page.resolver';
import { VisitorHomeComponent } from './components/visitor-home/visitor-home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitorLayoutComponent } from './components/visitor-layout/visitor-layout.component';
import { VisitorPageNotFoundComponent } from './components/visitor-page-not-found/visitor-page-not-found.component';
import { VisitorSignInComponent } from './components/account/visitor-sign-in/visitor-sign-in.component';
import { VisitorCreateAccountComponent } from './components/account/visitor-create-account/visitor-create-account.component';
import { VisitorForgotPasswordComponent } from './components/account/visitor-forgot-password/visitor-forgot-password.component';
import { VisitorResetPasswordComponent } from './components/account/visitor-reset-password/visitor-reset-password.component';
import { VisitorEmailConfirmedComponent } from './components/account/visitor-email-confirmed/visitor-email-confirmed.component';
import { VisitorVendorListComponent } from './components/visitor-vendor-list/visitor-vendor-list.component';
import { VisitorVendorDetailsComponent } from './components/visitor-vendor-details/visitor-vendor-details.component';
import { VisitorVendorProductListResolver } from './resolvers/visitor-vendor-product-list.resolver';
import { VisitorVendorListResolver } from './resolvers/visitor-vendor-list.resolver';
import { VisitorSearchComponent } from './components/visitor-search/visitor-search.component';
import { VisitorSearchResolver } from './resolvers/visitor-search.resolver';
import { VisitorAddressesComponent } from './components/my-account/visitor-addresses/visitor-addresses.component';
import { VisitorOrdersComponent } from './components/my-account/visitor-orders/visitor-orders.component';
import { VisitorOrderDetailsComponent } from './components/my-account/visitor-order-details/visitor-order-details.component';
import { VisitorTrackingComponent } from './components/visitor-tracking/visitor-tracking.component';
import { VisitorServiceInfoResolver } from './resolvers/visitor-service-info.resolver';
import { CheckoutGuard } from './guards/checkout.guard';
import { VisitorAddressDetailsComponent } from './components/my-account/visitor-address-details/visitor-address-details.component';
import { VisitorAuthGuard } from './guards/visitor-auth.guard';
import { VisitorCartComponent } from './components/cart-checkout/visitor-cart/visitor-cart.component';
import { VisitorCheckoutComponent } from './components/cart-checkout/visitor-checkout/visitor-checkout.component';
import { VisitorCheckoutCompleteComponent } from './components/cart-checkout/visitor-checkout-complete/visitor-checkout-complete.component';

const routes: Routes = [
    {
        path: '',
        component: VisitorLayoutComponent,
        data: {
        // home: '/qm-staff'
        // activePage: 'product_categories'
        },
        runGuardsAndResolvers: 'always',
        children: [
            {
                path: 'account',
                data: {
                    accountPage: true
                },
                children: [
                    {
                        path: 'signin',
                        component: VisitorSignInComponent
                    },
                    {
                        path: 'create',
                        component: VisitorCreateAccountComponent
                    },
                    {
                        path: 'email/confirmation',
                        component: VisitorEmailConfirmedComponent
                    },
                    {
                        path: 'password/forgot',
                        component: VisitorForgotPasswordComponent
                    },
                    {
                        path: 'password/reset',
                        component: VisitorResetPasswordComponent
                    }
                ]
            },
            {
                path: 'my-account',
                data: {
                    myAccountPage: true,
                    grayFlex: true
                },
                canActivate: [VisitorAuthGuard],
                component: VisitorMyAccountComponent,
                children: [
                    {
                        path: '',
                        component: VisitorDetailsComponent
                    },
                    {
                        path: 'profile',
                        component: VisitorDetailsComponent,
                        data: {
                            activePage: 'profile'
                        }
                    },
                    {
                        path: 'change-password',
                        component: VisitorChangePasswordComponent,
                        data: {
                            activePage: 'change-password'
                        }
                    },
                    {
                        path: 'address-book',
                        data: {
                            activePage: 'address'
                        },
                        children: [
                            {
                                path: '',
                                component: VisitorAddressesComponent
                            },
                            {
                                path: 'edit/:address-id',
                                data: {
                                    edit: true
                                },
                                component: VisitorAddressDetailsComponent
                            },
                            {
                                path: 'add',
                                data: {
                                    edit: false
                                },
                                component: VisitorAddressDetailsComponent
                            }
                        ]
                    },
                    {
                        path: 'orders',
                        data: {
                            activePage: 'orders'
                        },
                        children: [
                            {
                                path: '',
                                component: VisitorOrdersComponent
                            },
                            {
                                path: 'details/:order-id',
                                component: VisitorOrderDetailsComponent
                            }
                        ]
                    }
                ]
            },
            {
                path: 'contact',
                component: VisitorContactComponent
            },
            {
                path: 'about',
                component: VisitorAboutComponent
            },
            {
                path: 'terms-and-conditions',
                component: VisitorTermsAndConditionsComponent
            },
            {
                path: 'errand',
                children: [
                    /*{
                        path: 'food_delivery',
                        children: [
                            {
                                path: '',
                                component: VisitorProductListComponent,
                                resolve: {
                                    items: VisitorProductListResolver
                                },
                                runGuardsAndResolvers: 'always'
                            }
                        ]
                    },*/
                    {
                        path: ':serviceId',
                        component: VisitorServiceFormComponent,
                        runGuardsAndResolvers: 'always',
                        resolve: {
                            items: VisitorServiceInfoResolver
                        }
                    }
                ]
            },
            {
                path: 'vendors',
                children: [
                    {
                        path: '',
                        component: VisitorVendorListComponent,
                        resolve: {
                            vendors: VisitorVendorListResolver
                        }
                    },
                    {
                        path: ':id',
                        component: VisitorVendorDetailsComponent,
                        resolve: {
                            items: VisitorVendorProductListResolver
                        },
                        // runGuardsAndResolvers: 'always',
                    }
                ]
            },
            {
                path: 'search/:section',
                component: VisitorSearchComponent,
                resolve: {
                    items: VisitorSearchResolver
                },
                // runGuardsAndResolvers: 'always'
            },
            {
                path: 'tracking',
                data: {
                    grayFlex: true
                },
                component: VisitorTrackingComponent
            },
            {
                path: 'cart',
                data: {
                    grayFlex: true
                },
                component: VisitorCartComponent
            },
            {
                path: 'checkout',
                data: {
                    grayFlex: true,
                    checkOutPage: true
                },
                children: [
                    {
                        path: '',
                        canActivate: [CheckoutGuard],
                        component: VisitorCheckoutComponent,
                    },
                    {
                        path: 'failed',
                        data: {
                            hideCheckoutTitle: true,
                        },
                        component: VisitorCheckoutFailedComponent,
                    },
                    {
                        path: 'complete/:cartId',
                        data: {
                            hideCheckoutTitle: true,
                        },
                        component: VisitorCheckoutCompleteComponent,
                    }
                ]
            },
            {
                path: '',
                component: VisitorHomeComponent,
                resolve: {
                    items: VisitorHomePageResolver
                },
                data: {
                /*activePage: 'product_categories'
                breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Categories', url: ''},
                ],
                showBackButton: false*/
                }
            },
            {
                path: '**',
                component: VisitorPageNotFoundComponent
            }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }
