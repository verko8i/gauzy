import { Component, OnInit } from '@angular/core';
import {
	ITask,
	IOrganizationProject,
	IEmployee,
	IOrganizationTeam,
	ITag
} from '@gauzy/models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { OrganizationProjectsService } from '../../../../@core/services/organization-projects.service';
import { Store } from '../../../../@core/services/store.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlingService } from '../../../../@core/services/error-handling.service';
import { TranslationBaseComponent } from '../../../../@shared/language-base/translation-base.component';
import * as moment from 'moment';
import { OrganizationTeamsService } from '../../../../@core/services/organization-teams.service';

const initialTaskValue = {
	title: '',
	project: null,
	status: '',
	members: null,
	teams: null,
	estimate: null,
	dueDate: null,
	description: '',
	tags: null
};

@Component({
	selector: 'ngx-team-task-dialog',
	templateUrl: './team-task-dialog.component.html',
	styleUrls: ['./team-task-dialog.component.scss']
})
export class TeamTaskDialogComponent extends TranslationBaseComponent
	implements OnInit {
	form: FormGroup;
	selectedTaskId: string;
	projects: IOrganizationProject[];
	statuses: string[] = ['Todo', 'In Progress', 'For Testing', 'Completed'];
	employees: IEmployee[] = [];
	teams: IOrganizationTeam[] = [];
	selectedMembers: string[];
	selectedTeams: string[];
	selectedTask: ITask;
	organizationId: string;
	tags: ITag[] = [];

	constructor(
		public dialogRef: NbDialogRef<TeamTaskDialogComponent>,
		private fb: FormBuilder,
		private store: Store,
		private _organizationsStore: Store,
		private organizationProjectsService: OrganizationProjectsService,
		readonly translateService: TranslateService,
		private readonly toastrService: NbToastrService,
		private errorHandler: ErrorHandlingService,
		private organizationTeamsService: OrganizationTeamsService
	) {
		super(translateService);
	}

	ngOnInit() {
		this.loadProjects();
		this.loadTeams();
		this.initializeForm(this.selectedTask || initialTaskValue);
	}

	private async loadProjects() {
		const organizationId = this._organizationsStore.selectedOrganization.id;
		const { items } = await this.organizationProjectsService.getAll([], {
			organizationId
		});

		if (items) this.projects = items;
	}

	initializeForm({
		title,
		description,
		project,
		status,
		members,
		teams,
		estimate,
		dueDate,
		tags
	}: ITask) {
		const duration = moment.duration(estimate, 'seconds');
		this.selectedTeams = (teams || []).map((team) => team.id);
		// employee id of logged in user, if value is null, disable the save button
		// this.teamIds = null;
		// if (this.store.user) {
		// 	this.teamIds = this.store.user || null;
		// }
		// // select default id of logged in user
		// if (teams === null) {
		// 	this.selectedTeams = [this.employeeId];
		// }
		this.form = this.fb.group({
			title: [title, Validators.required],
			project: [project],
			status: [status],
			members: [members],
			estimateDays: [duration.days() || ''],
			estimateHours: [
				duration.hours() || '',
				[Validators.min(0), Validators.max(23)]
			],
			estimateMinutes: [
				duration.minutes() || '',
				[Validators.min(0), Validators.max(59)]
			],
			dueDate: [dueDate],
			description: [description],
			tags: [tags],
			teams: [this.selectedTeams]
		});

		this.tags = this.form.get('tags').value || [];
	}

	addNewProject = (name: string): Promise<IOrganizationProject> => {
		this.organizationId = this.store.selectedOrganization.id;
		try {
			this.toastrService.primary(
				this.getTranslation(
					'NOTES.ORGANIZATIONS.EDIT_ORGANIZATIONS_PROJECTS.ADD_PROJECT',
					{
						name: name
					}
				),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
			return this.organizationProjectsService.create({
				name,
				organizationId: this.organizationId
			});
		} catch (error) {
			this.errorHandler.handleError(error);
		}
	};

	onSave() {
		if (this.form.valid) {
			this.form
				.get('teams')
				.setValue(
					(this.selectedTeams || [])
						.map((id) => this.teams.find((e) => e.id === id))
						.filter((e) => !!e)
				);
			this.dialogRef.close(this.form.value);
		}
	}

	selectedTagsHandler(currentSelection: ITag[]) {
		this.form.get('tags').setValue(currentSelection);
	}

	async loadTeams() {
		const organizationId = this._organizationsStore.selectedOrganization.id;
		if (!organizationId) {
			return;
		}
		this.teams = (
			await this.organizationTeamsService.getMyTeams(['members'])
		).items.filter((org) => {
			return org.organizationId === organizationId;
		});
	}

	onTeamsSelected(teamsSelection: string[]) {
		this.selectedTeams = teamsSelection;
	}
}
