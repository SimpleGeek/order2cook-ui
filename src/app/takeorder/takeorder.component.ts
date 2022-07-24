import { Component, OnInit } from '@angular/core';
import { MenuItem } from '../entities/menuitem';
import { OrderedMenuItem } from '../entities/orderedmenuitem';
import { MenuitemService } from '../menuitem.service';
import { MENUITEMS } from '../mock-data/mock-menu-items';

@Component({
  selector: 'app-takeorder',
  templateUrl: './takeorder.component.html',
  styleUrls: ['./takeorder.component.scss']
})
export class TakeorderComponent implements OnInit {

  menuItems = MENUITEMS;
  searchedMenuItemStr: string = "";
  searchedMenuItem: MenuItem = {} as MenuItem;
  numToOrder: number = 1;
  notifySearchFoundItem: boolean = false;
  notifySearchDidNotFindItem: boolean = false;
  itemsOnOrder: OrderedMenuItem[] = [];
  orderReadyToComplete: boolean = false;

  constructor(private menuItemService: MenuitemService) { }

  ngOnInit(): void {
  }

  onSearch(): void {
    // Clear notifications
    this.clearNotifications();

    // Search for the menu item using the service
    let menuItem: MenuItem;
    try {
      menuItem = this.searchForMenuItem();
      console.log('Found menu item with id ' + menuItem.id + ' and name ' + menuItem.name
                    + ' and qty ' + menuItem.onHandQty);
      
      this.searchedMenuItem = menuItem;
      this.notifySearchFoundItem = true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.notifySearchDidNotFindItem = true;
        console.error("Couldn't find menu item from search string.  Error:");
        console.error(e.message);
      } else {
        console.error("Caught something from the menu item search, but it's not an Error.");
      }
      this.clearInput();
    }
  }

  searchForMenuItem(): MenuItem {
    return this.menuItemService.searchForMenuItem(this.searchedMenuItemStr);
  }

  validateOrderQtyChange(changeToQty: number, menuItem: MenuItem): boolean {
    // Validate that the quantity of the item the user is trying
    // to order is valid; namely, that it is at least 1, and is
    // not greater than the amount of the item on hand.
    return (changeToQty >= 1 && changeToQty <= menuItem.onHandQty);
  }

  incrementNumToOrder(): void {
    if (this.searchedMenuItem == {} as MenuItem) {
      return;
    }

    if (this.validateOrderQtyChange((this.numToOrder + 1), this.searchedMenuItem)) {
      this.numToOrder += 1;
    }
  }

  decrementNumToOrder(): void {
    if (this.searchedMenuItem == {} as MenuItem) {
      return;
    }

    if (this.validateOrderQtyChange((this.numToOrder - 1), this.searchedMenuItem)) {
      this.numToOrder -= 1;
    }
  }

  clearInput(): void {
    this.numToOrder = 1;
    this.searchedMenuItemStr = "";
    this.searchedMenuItem = {} as MenuItem;
  }

  clearNotifications(): void {
    this.notifySearchFoundItem = false;
    this.notifySearchDidNotFindItem = false;
  }

  clear(): void {
    this.clearInput();
    this.clearNotifications();
  }

  incrementIfOnOrder(): boolean {
    return this.itemsOnOrder.filter((i: OrderedMenuItem) => i.menuItem.id === this.searchedMenuItem.id)
                      .map((i: OrderedMenuItem) => {
                        if (!this.validateOrderQtyChange((i.qtyOrdered + this.numToOrder),
                                  this.searchedMenuItem)) {
                          console.log('Tried to add ' + this.numToOrder + ' more ' + this.searchedMenuItem.name
                          + ', which is > the quantity on hand: ' + this.searchedMenuItem.onHandQty);
                          console.log('Setting order qty for item to the max value of '
                          + this.searchedMenuItem.onHandQty + ' instead');
                          return;
                        }
                        i.qtyOrdered += this.numToOrder;
                      }).length >= 1;
  }

  addItemToOrder(): void {
    if (Object.keys(this.searchedMenuItem).length === 0) {
      console.log('Tried to add an item, but there was no item selected');
      return;
    }

    // Check to see if item was already added to order,
    // and if so, increment the quantity on order rather
    // than displaying a new line item.
    if (!this.incrementIfOnOrder()) {
      // Item was not already on order, so add a new line item
      this.itemsOnOrder.push({menuItem: this.searchedMenuItem, qtyOrdered: this.numToOrder});
    }

    this.orderReadyToComplete = true;
    this.clear();
  }

  changeFromConfirmationList(item: OrderedMenuItem): void {
    console.log('Changing from confirm list: item name and qty ordered' + item.menuItem.name
                  + ' ' + item.qtyOrdered); // TODO: Remove when done debugging
    // The user could have entered some invalid number for the order item
    // amount - could be either less than 1, or greater than the
    // on hand qty.  Check to see if that is the case.  Can't use the
    // utility method for validating quantities here, as it doesn't distuingish
    // between the two cases, which we need to do here so we can decide what
    // to set the actual ordered quantity to.
    // There is no else here, because the property binding in the template
    // should set the value, and we're fine with whatever the user provides
    // as long as it's not too high or too low.
    if (item.qtyOrdered < 1) {
      // Ordered less than 1 - default to 1
      item.qtyOrdered = 1;
    } else if (item.qtyOrdered > item.menuItem.onHandQty) {
      // Ordered more than the qty on hand - set to max
      // qty on hand.
      item.qtyOrdered = item.menuItem.onHandQty;
    }
  }

  deleteItemFromConfirmationList(item: OrderedMenuItem): void {
    // Remove item from click on confirmation list
  }

  clearAll(): void {
    this.clear();
    this.itemsOnOrder = [];
    this.orderReadyToComplete = false;
  }

  completeOrder(): void {
    console.log('Completing order');
    this.itemsOnOrder.forEach(i => console.log('Item on order: ' + i.menuItem.name
                                                + ' qty ordered: ' + i.qtyOrdered));
  }

}
