import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { VendorLiteViewModel, VendorGroupViewModel } from 'src/app/models/vendor';
import { Pagination } from 'src/app/models/pagination';
import { VisitorVendorService } from '../../services/visitor-vendor.service';

@Component({
  selector: 'app-visitor-vendor-list',
  templateUrl: './visitor-vendor-list.component.html',
  styleUrls: ['./visitor-vendor-list.component.css']
})
export class VisitorVendorListComponent implements OnInit {

    Vendors: VendorLiteViewModel[];
    VendorGroups: VendorGroupViewModel[];

    NewEntryCount = -1;
    backgroundLoadingItems = false;

    pagination: Pagination;

    Search = {
        searchTerm: '',
        section: 'vendors'
    };

    constructor(private title: Title,
                private actRoute: ActivatedRoute,
                private router: Router,
                private vendorService: VisitorVendorService,
                private notify: NotificationService) {
        // set page title
        this.title.setTitle('Vendors | Quick Waka');

        this.VendorGroups = [];

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 50,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };
    }

    ngOnInit() {
        this.actRoute.data.subscribe(data => {
            this.pagination.currentPage = data.vendors.pagination.currentPage;
            this.pagination.totalCount = data.vendors.pagination.totalCount;

            this.Vendors = data.vendors.result;

            this.groupVendors(this.Vendors);
        });
    }

    groupVendors(vendorList) {
        for (const Vend of vendorList) {
            const firstLetter = Vend.name.substr(0, 1);
            let group = this.VendorGroups.find(x => x.title === firstLetter);
            if (!group) {
                group = new VendorGroupViewModel(firstLetter);
                this.VendorGroups.push(group);
            }
            group.vendors.push(Vend);
        }
    }

    onScroll() {
        if (this.NewEntryCount !== 0) {
            this.backgroundLoadingItems = true;
            this.pagination.currentPage++;

            return this.vendorService.getVendors(this.pagination.currentPage, this.pagination.itemsPerPage).subscribe(
                // success
                response => {
                    this.pagination.currentPage = response.pagination.currentPage;
                    this.pagination.totalCount = response.pagination.totalCount;

                    const newVendors = response.result;
                    this.NewEntryCount = newVendors.length;

                    // add new vendors
                    this.groupVendors(newVendors);

                    // loading has completed successfully
                    this.backgroundLoadingItems = false;
                },

                // error
                error => {
                    this.notify.error('Problem loading items, please reload page.');
                    this.backgroundLoadingItems = false;
                }
            );
        }
    }


    // SEARCH
    globalSearch() {
        if (this.Search.searchTerm.trim().length > 0) {
            this.router.navigate(['/search', this.Search.section],
            { queryParams : { searchTerm : this.Search.searchTerm}});
        }
    }
}
