import { Routes } from '@angular/router';

export const routes: Routes = [

    {path: '', redirectTo: '/list', pathMatch: 'full'},
    {path:'list', loadComponent:()=> import('../app/list/list.component').then(c=>c.ListComponent)}    

];
