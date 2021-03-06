import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrganizationsService } from 'apps/gauzy/src/app/@core/services/organizations.service';
import { IOrganization } from '@gauzy/models';
import { Store } from 'apps/gauzy/src/app/@core/services/store.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersOrganizationsService } from 'apps/gauzy/src/app/@core/services/users-organizations.service';

@Component({
	selector: 'ga-organization-selector',
	templateUrl: './organization.component.html',
	styleUrls: ['./organization.component.scss']
})
export class OrganizationSelectorComponent implements OnInit, OnDestroy {
	organizations: IOrganization[];
	selectedOrganization: IOrganization;

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private organizationsService: OrganizationsService,
		private store: Store,
		private userOrganizationService: UsersOrganizationsService
	) {}

	ngOnInit() {
		this.loadOrganizationsId();
		this.loadOrganizations();
	}

	selectOrganiztion(organization: IOrganization) {
		if (organization) {
			this.store.selectedOrganization = organization;
			this.store.selectedEmployee = null;
		}
	}

	private async loadOrganizations(): Promise<void> {
		const { items = [] } = await this.userOrganizationService.getAll(
			['organization'],
			{
				userId: this.store.userId
			}
		);

		this.organizations = items.map((userOrg) => userOrg.organization);

		if (this.organizations.length > 0 && !this.store.selectedOrganization) {
			// set first organizations as default
			this.store.selectedOrganization = this.organizations[0];
		}
	}

	private loadOrganizationsId() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((organization: IOrganization) => {
				this.selectedOrganization = organization;
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
