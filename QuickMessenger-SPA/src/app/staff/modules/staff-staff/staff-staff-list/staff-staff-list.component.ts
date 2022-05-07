import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pagination } from 'src/app/models/pagination';
import { StaffViewModel } from 'src/app/models/staff';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { StaffStaffService } from '../staff-staff.service';
import { NotificationService } from 'src/app/services/notification.service';
import { StaffLayoutComponent } from '../../staff-shared/components/staff-layout/staff-layout.component';
import { StaffStaffAddComponent } from '../staff-staff-add/staff-staff-add.component';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-staff-staff-list',
    templateUrl: './staff-staff-list.component.html',
    styleUrls: ['./staff-staff-list.component.css']
})
export class StaffStaffListComponent implements OnInit {

    contentLoading = false;
    pagination: Pagination;

    Staff: StaffViewModel[] = [];
    // DisplayedStaff: StaffListViewModel[] = [];

    @ViewChild('searchText', {static: false}) searchText: ElementRef;
    lastSearchTerm: string = null;
    private searchTerms = new Subject<string>();

    Filter: {role: string[], deactivated: string} = { role : [], deactivated: 'false'};
    SelectedFilter: {role: string[], deactivated: string} = { role : [], deactivated: 'false'};
    filtered: boolean;
    FilteredElements: any[] = [];
    RoleFullNames: any;

    modalRef: NgbModalRef;
    private modalConfig: NgbModalOptions = {
        size: 'xl',
        centered: true,
        keyboard: false,
        backdrop: 'static'
    };

    constructor(private titleService: Title,
                parentComponent: StaffLayoutComponent,
                private staffService: StaffStaffService,
                private notify: NotificationService,
                private modalService: NgbModal) {

        // set page title
        this.titleService.setTitle('Staff | Quick Waka');

        // set page heading
        parentComponent.PageHeading = 'Staff';
        parentComponent.PageSubHeading = '';

        // initialize pagination parameters
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 20,
            totalCount: 0,
            maxSize: 5,
            rotate: true
        };

        this.RoleFullNames = {
            Admin : 'Administrator',
            Rider : 'Rider',
            FrontDesk: 'Front Desk Operator'
        };
    }

    ngOnInit() {
        // this.createDummyData();
        this.loadStaff();
        this.setupSearch();
    }

    setupSearch() {
        this.searchTerms.pipe(
            // wait 500ms after each keystroke before considering the term
            debounceTime(400),

            // ignore new term if same as previous term
            distinctUntilChanged(),

            // switch to new search observable each time the term changes
            switchMap((term: string) => this.staffService.getStaffList(1, this.pagination.itemsPerPage, term,
                this.Filter.role, this.Filter.deactivated))
        ).subscribe(response => {
            this.pagination.currentPage = response.pagination.currentPage;
            this.pagination.totalCount = response.pagination.totalCount;

            this.Staff = response.result;

            this.contentLoading = false;
        });
    }

    createDummyData() {
        /*this.Staff = [
        {
            firstName : 'Ebuka',
            lastName : 'Olisaemeka',
            gender : 'Male',
            email : 'olisaemekaebuka@gmail.com',
            phone : '+2347039466051',
            role : 'Rider'
        },
        {
            firstName : 'Vincent',
            lastName : 'Mazi',
            gender : 'Male',
            email : 'vincentgeorge@gmail.com',
            phone : '+2347039466051',
            role : 'Administrator'
        },
        {
            firstName : 'Nneka',
            lastName : 'Ogbonna',
            gender : 'Female',
            email : 'ogbonnaneka@gmail.com',
            phone : '+2347039466051',
            role : 'Administrator'
        },
        {
            firstName : 'Uchechi',
            lastName : 'Okah',
            gender : 'Female',
            email : 'okahuchechi@gmail.com',
            phone : '+2347039466051',
            role : 'Front Desk Operator'
        },
        {
            firstName : 'Agozie',
            lastName : 'Okechukwu',
            gender : 'Male',
            email : 'victoragome@gmail.com',
            phone : '+2347039466051',
            role : 'Rider'
        }
        ];
        this.pagination.totalCount = this.Staff.length;
        this.DisplayedStaff = this.Staff.slice(0, this.pagination.itemsPerPage);*/
    }

    // Content Loading Operations
    loadStaff(pageNumber?: number) {
        this.contentLoading = true;

        pageNumber = pageNumber || this.pagination.currentPage;
        // ensure this uses search and filter
        this.staffService.getStaffList(pageNumber, this.pagination.itemsPerPage, this.lastSearchTerm,
            this.Filter.role, this.Filter.deactivated)
        .subscribe(
            // success
            response => {
                this.pagination.currentPage = response.pagination.currentPage;
                this.pagination.totalCount = response.pagination.totalCount;

                this.Staff = response.result;
                this.SelectedFilter.deactivated = this.Filter.deactivated;
                this.SelectedFilter.role = [];
                this.Filter.role.forEach((value: string) => {
                    this.SelectedFilter.role.push(value);
                });

                // show filters
                this.filtered = false;
                this.FilteredElements = [];
                for (const key in this.Filter) {
                    if (this.Filter.hasOwnProperty(key)) {
                        const value = this.Filter[key];
                        if (Array.isArray(value)) {
                            if (value.length > 0) {
                                this.filtered = true;
                                for (const index in value) {
                                    if (value.hasOwnProperty(index)) {
                                        this.FilteredElements.push({key, value: this.RoleFullNames[value[index]], index });
                                    }
                                }
                            }
                        } else if (value !== null) {
                            this.filtered = true;
                            this.FilteredElements.push({key: key === 'deactivated' ? 'Status' : key,
                                 value: (key === 'deactivated' ? (value === 'true' ? 'Inactive' : 'Active') : value)});
                        }
                    }
                }

                this.contentLoading = false;
            },

            // error
            error => {
                this.notify.error('Problem loading staff list, please reload page.');
                this.contentLoading = false;
            }
        );
    }

    reloadPage() {
        this.clearFilterForReload();
        this.searchText.nativeElement.value = '';
        this.setupSearch();
        this.lastSearchTerm = null;
        this.loadStaff(1);
    }

    pageChanged(newPageNumber: number): void {
        /*const startItem = (newPageNumber - 1) * this.pagination.itemsPerPage;
        const endItem = newPageNumber * this.pagination.itemsPerPage;
        this.DisplayedStaff = this.Staff.slice(startItem, endItem);*/

        this.pagination.currentPage = newPageNumber;
        this.loadStaff();
        window.scrollTo(0, 0);
    }


    // Search Operations
    search(term: string): void {
        this.contentLoading = true;
        this.searchTerms.next(term);
        this.lastSearchTerm = term;
    }


    // Filter Opeations
    clearFilterForReload() {
        this.Filter.role = [];
        // this.Filter.deactivated = 'false';
    }

    clearFilter() {
        this.Filter.role = [];
        this.Filter.deactivated = 'false';
        if (this.filtered) {
            this.loadStaff(1);
        }
    }

    handleFilterOpen() {
        // return to previous settings
        this.Filter.deactivated = this.SelectedFilter.deactivated;
        this.Filter.role = [];
        this.SelectedFilter.role.forEach((value: string) => {
            this.Filter.role.push(value);
        });
    }

    toggleFilterRole(role: string) {
        const index = this.Filter.role.indexOf(role);
        if (index === -1) {
            this.Filter.role.push(role);
        } else {
            this.Filter.role.splice(index, 1);
        }
    }

    removeFilter(key: string, index?: number) {
        if (index === null) {
        this.Filter[key] = null;
        } else if (Array.isArray(this.Filter[key])) {
        this.Filter[key].splice(index, 1);
        }
        this.loadStaff(1);
    }

    filter() {
        this.loadStaff(1);
    }


    // Create & Edit Operations
    openNewStaffModal() {
        const initialState = {
            title: 'Add Staff'
        };
        this.modalRef = this.modalService.open(StaffStaffAddComponent, this.modalConfig);
        this.modalRef.componentInstance.initialState = initialState;
        this.modalRef.componentInstance.staffCreated.subscribe(
            () => {
                this.modalRef.close();
                this.notify.success('Staff was created successfully!');
                this.reloadPage();
            }
        );
    }

    openStaffEditModal(selectedStaff: StaffViewModel) {
        const initialState = {
            title: 'Edit Staff',
            Staff: selectedStaff
        };
        this.modalRef = this.modalService.open(StaffStaffAddComponent, this.modalConfig);
        this.modalRef.componentInstance.initialState = initialState;
        this.modalRef.componentInstance.staffEdited.subscribe(
            () => {
                this.modalRef.close();
                this.notify.success('Staff was updated successfully!');
                this.reloadPage();
            }
        );
        this.modalRef.componentInstance.staffDeleted.subscribe(
            () => {
                this.modalRef.close();
                this.notify.success('Staff was deleted successfully!');
                this.reloadPage();
            }
        );
    }
}
