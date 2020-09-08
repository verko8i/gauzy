import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslationBaseComponent } from '../../../../@shared/language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { UpworkStoreService } from 'apps/gauzy/src/app/@core/services/upwork-store.service';

@Component({
	selector: 'ngx-upwork',
	templateUrl: './upwork.component.html'
})
export class UpworkComponent extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	private _ngDestroy$: Subject<void> = new Subject();
	tabs: any[];
	supportContextActions: NbMenuItem[];
	integrationId: string;

	constructor(
		readonly translateService: TranslateService,
		private _ar: ActivatedRoute,
		private _us: UpworkStoreService
	) {
		super(translateService);
	}

	ngOnInit() {
		this._getConfig();
		this.loadTabs();
		this.loadActions();
		this._applyTranslationOnTabs();
	}

	private _getConfig() {
		const integrationdId = (this.integrationId = this._ar.snapshot.params.id);
		this._us
			.getConfig(integrationdId)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe();
	}

	getRoute(tabName: string) {
		return `./${tabName}`;
	}

	loadTabs() {
		this.tabs = [
			{
				title: this.getTranslation(
					'INTEGRATIONS.UPWORK_PAGE.ACTIVITIES'
				),
				icon: 'trending-up-outline',
				responsive: true,
				route: this.getRoute('activities')
			},
			{
				title: this.getTranslation('INTEGRATIONS.UPWORK_PAGE.REPORTS'),
				icon: 'file-text-outline',
				responsive: true,
				route: this.getRoute('reports')
			},
			{
				title: this.getTranslation(
					'INTEGRATIONS.UPWORK_PAGE.TRANSACTIONS'
				),
				icon: 'flip-outline',
				responsive: true,
				route: this.getRoute('transactions')
			},
			{
				title: this.getTranslation(
					'INTEGRATIONS.UPWORK_PAGE.CONTRACTS'
				),
				icon: 'book-outline',
				responsive: true,
				route: this.getRoute('contracts')
			}
		];
	}

	loadActions() {
		this.supportContextActions = [
			{
				title: this.getTranslation(
					'INTEGRATIONS.UPWORK_PAGE.RE_INTEGRATE'
				),
				icon: 'text-outline',
				link: `pages/integrations/upwork/regenerate`
			},
			{
				title: this.getTranslation('INTEGRATIONS.UPWORK_PAGE.SETTINGS'),
				icon: 'settings-2-outline',
				link: `pages/integrations/upwork/${this.integrationId}/settings`
			}
		];
	}

	private _applyTranslationOnTabs() {
		this.translateService.onLangChange
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this.loadTabs();
			});
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
