import {Page} from "../../resources/models/Page";
import {autoinject, bindable, containerless} from "aurelia-framework";
import {Router} from "aurelia-router";
import {ReadingManager} from "../../resources/reading/ReadingManager";
import {UpdateStatesResponse} from "../../resources/interfaces/UpdateStatesResponse";
import {PageListCustomElement} from "./page-list";

@autoinject()
@containerless()
export class PageSummary{

    @bindable page: Page;
    @bindable storyId: string;
    @bindable readingId: string;
    @bindable demoMode: boolean;
    @bindable pageList: PageListCustomElement;
    @bindable pageFunctionsExecuting: boolean;

    constructor(private element: Element, private router: Router, private readingManager: ReadingManager) {}

    private locatePage() {
        if (!this.demoMode) {
            return;
        }

        this.element.dispatchEvent(this.createLocateEvent(this.page.id));
    }

    private createLocateEvent(pageId: string) {
        if ((window as any).CustomEvent) {
            return new CustomEvent('locate', {bubbles: true, detail: pageId});
        }

        let changeEvent = document.createEvent('CustomEvent');
        changeEvent.initCustomEvent('locate', true, true, pageId);
        return changeEvent;
    }

    callPageFunctions() {
        //Force a revalidation before allowing the page functions to execute.
        this.readingManager.updateStatus();
        if(!this.page.isReadable) { return; }

        this.pageList.hidePages = true;
        if (this.pageFunctionsExecuting) { return false; }
        this.pageFunctionsExecuting = true;


        this.readingManager.executePageFunctionsAndSave(this.page).then((result: UpdateStatesResponse) => {
            this.router.navigateToRoute("page-read", {
                pageId: this.page.id,
                storyId: this.storyId,
                readingId: this.readingId
            });
        },
        (result: UpdateStatesResponse) => {
            this.pageList.hidePages = false;
        }).then(() => {
            //Don't believe this is necessary, as ReadingManager should update itself.
            this.readingManager.updateStatus();
        })
    }

}
