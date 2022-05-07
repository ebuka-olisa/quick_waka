import { StaffProductsModalContainerComponent } from './staff-products-modal-container.component';
import { StaffProductsExtraAttributesModalContainerComponent } from './staff-products-extra-attributes-modal-container.component';
import { StaffProductsCategoriesModalContainerComponent } from './staff-products-categories-modal-container.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffLayoutComponent } from '../staff-shared/components/staff-layout/staff-layout.component';
import { StaffPageNotFoundComponent } from '../staff-shared/components/staff-page-not-found/staff-page-not-found.component';
import { StaffProductsCategoriesListComponent } from './staff-products-categories-list/staff-products-categories-list.component';
import { StaffProductsListComponent } from './staff-products-list/staff-products-list.component';
import { StaffProductsExtraAttributesListComponent } from './staff-products-extra-attributes-list/staff-products-extra-attributes-list.component';
import { StaffProductsMeasurementMetricsListComponent } from './staff-products-measurement-metrics-list/staff-products-measurement-metrics-list.component';
import { StaffProductsMeasurementMetricsModalContainerComponent } from './staff-products-measurement-metrics-modal-container.component';

const routes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    data: {
      home: '/qm-staff'
    },
    children: [
      {
        path: 'categories',
        data: {
          activePage: 'product_categories'
        },
        children: [
          {
            path: '',
            component: StaffProductsCategoriesListComponent,
            data: {
              breadcrumb: [
                {label: 'Products', url: '/qm-staff/products'},
                {label: 'Categories', url: ''},
              ],
              showBackButton: false
            },
            children: [
              {
                path: 'add',
                component: StaffProductsCategoriesModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Categories', url: ''},
                  ]
                },
              },
              {
                path: ':id',
                component: StaffProductsCategoriesModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Categories', url: ''},
                  ]
                },
              }
            ]
          }
        ]
      },
      {
        path: 'extra_attributes',
        data: {
          activePage: 'product_extra_attributes'
        },
        children: [
          {
            path: '',
            component: StaffProductsExtraAttributesListComponent,
            data: {
              breadcrumb: [
                {label: 'Products', url: '/qm-staff/products'},
                {label: 'Extra Attributes', url: ''},
              ],
              showBackButton: false
            },
            children: [
              {
                path: 'add',
                component: StaffProductsExtraAttributesModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Extra Attributes', url: ''},
                  ]
                },
              },
              {
                path: ':id',
                component: StaffProductsExtraAttributesModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Extra Attributes', url: ''},
                  ]
                },
              }
            ]
          }
        ]
      },
      {
        path: 'measurement_metrics',
        data: {
          activePage: 'product_measurement_metrics'
        },
        children: [
          {
            path: '',
            component: StaffProductsMeasurementMetricsListComponent,
            data: {
              breadcrumb: [
                {label: 'Products', url: '/qm-staff/products'},
                {label: 'Measurement Metrics', url: ''},
              ],
              showBackButton: false
            },
            children: [
              {
                path: 'add',
                component: StaffProductsMeasurementMetricsModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Measurement Metrics', url: ''},
                  ],
                  showBackButton: false
                }
              },
              {
                path: ':id',
                component: StaffProductsMeasurementMetricsModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: '/qm-staff/products'},
                    {label: 'Measurement Metrics', url: ''},
                  ],
                  showBackButton: false
                }
              }
            ]
          }
        ]
      },
      {
        path: '',
        data: {
          activePage: 'products'
        },
        children: [
          {
            path: '',
            component: StaffProductsListComponent,
            data: {
              breadcrumb: [
                {label: 'Products', url: ''}
              ],
              showBackButton: false
            },
            children: [
              {
                path: 'add',
                component: StaffProductsModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: ''}
                  ]
                },
              },
              {
                path: ':id',
                component: StaffProductsModalContainerComponent,
                data: {
                  breadcrumb: [
                    {label: 'Products', url: ''}
                  ]
                },
              }
            ]
          },
          {
            path: '**',
            component: StaffPageNotFoundComponent,
            data: {
              breadcrumb: [
                {label: 'Products', url: '/qm-staff/products'},
                {label: 'Page Not Found', url: ''}
              ],
              showBackButton: false
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffProductsRoutingModule { }
