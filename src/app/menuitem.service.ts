import { Injectable } from '@angular/core';
import { MenuItem } from './entities/menuitem';
import { MENUITEMS } from './mock-data/mock-menu-items';

@Injectable({
  providedIn: 'root'
})
export class MenuitemService {

  constructor() { }

  menuItems: MenuItem[] = [];

  lowerCaseName = (m: MenuItem) => {m.name = m.name.toLowerCase()};

  /*
   * Searches for a valid MenuItem, based on the search string
   * entered by the user.
   */
  searchForMenuItem(searchStr: string): MenuItem {
    this.loadMenuItems();

    searchStr = searchStr.toLowerCase();

    // TODO: Should eventually support fuzzy matching, but,
    // for now, just search for exact (albeit, case-insensitive) matches.
    const foundMenuItem = this.menuItems.find((m: MenuItem) => m.name.toLowerCase() === searchStr);
    if (foundMenuItem === undefined) {
      throw Error('No menu item found matching ' + searchStr);
    }
    return foundMenuItem;
  }

  loadMenuItems(): void {
    // Get latest menu items, based on complex caching rules, etc.
    // TODO: For now, just getting the mock data.
    this.menuItems = MENUITEMS;
  }

}
