import { VendorLiteViewModel } from 'src/app/models/vendor';
import { ServiceListViewModel } from 'src/app/models/service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-visitor-home',
    templateUrl: './visitor-home.component.html',
    styleUrls: ['./visitor-home.component.css']
})
export class VisitorHomeComponent implements OnInit {

    Services: ServiceListViewModel[];
    Vendors: VendorLiteViewModel[];

    Search = {
        searchTerm: '',
        section: 'products'
    };

    SlideOptions = { items: 1, dots: true, nav: false, loop: true, autoplay: true };
    SlideOptions2 = { items: 1, dots: false, nav: true, loop: true, autoplay: true };
    CarouselOptions = { items: 3, dots: true, nav: true };

    constructor(private title: Title,
                private router: Router,
                private actRoute: ActivatedRoute) {
        // set page title
        this.title.setTitle('Quick Waka | Have an errand? We go waka am for you');
    }

    ngOnInit() {
        this.actRoute.data.subscribe(data => {
            this.Services = data.items.services;
            this.Vendors = data.items.vendors;
        });
    }

    search() {
        if (this.Search.searchTerm.trim().length > 0) {
            this.router.navigate(['/search', 'products'], { queryParams : { searchTerm : this.Search.searchTerm}});
        }
    }

}
