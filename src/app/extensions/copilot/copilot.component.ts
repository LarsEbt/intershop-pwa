import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { COPILOT_SETTINGS } from 'ish-core/configurations/injection-keys';
import { ShoppingFacade } from 'ish-core/facades/shopping.facade';
import { FeatureToggleService } from 'ish-core/feature-toggle.module';
import { InjectSingle } from 'ish-core/utils/injection';

import { CompareFacade } from '../compare/facades/compare.facade';

import { CopilotFacade } from './facades/copilot.facade';
import { routerCancelAction } from '@ngrx/router-store';

//Dinge die ich importiere (safe falsch oder nicht benötigt)

@Component({
  selector: 'app-current-url',
  templateUrl: './current-url.component.html',
  styleUrls: ['./current-url.component.css']
})
export class CurrentUrlComponent implements OnInit {
  fullUrl: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Holen der vollständigen URL
    this.fullUrl = this.router.url;
    
  }
}

interface ToolCall {
  tool: string;
  toolInput?: {
    Query?: string;
    SKU?: string;
    SKUs?: string;
    Products?: string;
    Page?: string;
  };
}

@Component({
  selector: 'ish-app-copilot',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopilotComponent implements OnInit, OnDestroy {
  private renderer: Renderer2;
  private destroy$ = new Subject<void>();
  copilotToolCall$: Observable<string>;

  restEndpoint$: Observable<string>;
  locale = 'en_US';
  private toolCallEventHandler: (event: Event) => void;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(COPILOT_SETTINGS) private copilotSettings: InjectSingle<typeof COPILOT_SETTINGS>,
    private featureToggleService: FeatureToggleService,
    private ngZone: NgZone,
    private router: Router,
    private copilotFacade: CopilotFacade,
    private compareFacade: CompareFacade,
    private shoppingFacade: ShoppingFacade
  ) {
    this.renderer = rendererFactory.createRenderer(undefined, undefined);
  }

  private get window(): Window {
    return this.document.defaultView;
  }

  private get isBrowser(): boolean {
    return !SSR;
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeCopilot();
      this.copilotToolCall$ = this.copilotFacade.copilotToolCall$;
      this.copilotFacade.setCopilotToolCall('product_search');

      // Bind the event handler and store the reference
      this.toolCallEventHandler = this.onToolCallEvent.bind(this);
      this.document.addEventListener('toolCallEvent', this.toolCallEventHandler);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (this.window as any).handleToolCall;
    }
  }

  private async handleToolCall(toolCall: ToolCall) {
    if (!toolCall?.tool) {
      return;
    }

    switch (toolCall.tool) {
      case 'language_english':
        
        
        break;
      case 'open_checkout':
        
        this.navigate(`/checkout/address`);
        break;
      //case 'open_help_page_specific':
      //this.navigate(`/page/page.helpdesk/${toolCall.toolInput?.Page}`);
      //break;
      case 'open_help_page':
        this.navigate('/page/page.helpdesk.pagelet2-Page');
        break;
      case 'product_search':
        this.navigate(`/search/${toolCall.toolInput?.Query}`);
        break;
      case 'product_detail_page':
        this.navigate(`/product/${toolCall?.toolInput?.SKU}`);
        break;
      case 'get_product_variations':
        this.navigate(`/product/${toolCall.toolInput?.SKU}`);
        break;
      case 'open_basket':
        this.navigate('/basket');
        break;
      case 'compare_products':
        this.handleCompareProducts(toolCall.toolInput?.SKUs);
        break;
      case 'add_product_to_basket':
        this.ngZone.run(() => {
          const skus = toolCall.toolInput?.Products?.split(';') || [];
          skus.forEach(sku => {
            this.shoppingFacade.addProductToBasket(sku, 1);
          });
        });
        break;
      default:
        break;
    }
  }

  

 

  private onToolCallEvent(event: Event): void {
    const customEvent = event as CustomEvent;
    this.handleToolCall(customEvent.detail);
  }

  private async getRestEndpoint() {
    const [locale, currency, restEndpoint] = await Promise.all([
      this.copilotFacade.getCurrentLocale(),
      this.copilotFacade.getCurrentCurrency(),
      this.copilotFacade.getRestEndpoint(),
    ]);

    this.locale = locale || 'en_US';
    const currencyCode = currency || 'USD';

    return `${restEndpoint};loc=${this.locale};cur=${currencyCode}`;
  }

  private handleCompareProducts(skuString: string) {
    const newProductIds = skuString ? skuString.split(';') : [];

    this.compareFacade.compareProducts$.pipe(take(1), takeUntil(this.destroy$)).subscribe(currentCompareIds => {
      currentCompareIds.forEach(id => this.compareFacade.removeProductFromCompare(id));
      newProductIds.forEach(id => this.compareFacade.toggleProductCompare(id));

      this.ngZone.run(() => {
        this.router.navigate(['/compare']);
      });
    });
  }

  private navigate(url: string): void {
    this.ngZone.run(() => this.router.navigateByUrl(url));
  }

  private async initializeCopilot() {
    if (this.isBrowser && this.featureToggleService.enabled('copilot')) {
      const [customer, restEndpoint] = await Promise.all([
        this.copilotFacade.getCustomerState(),
        this.getRestEndpoint(),
      ]);

      const token = localStorage.getItem('icm_access_token');
      const primaryColor = this.getPrimaryColor();
      const welcomeMessage = this.getWelcomeMessage();

      // Load the external script
      const scriptContent = this.getChatbotScriptContent(customer, restEndpoint, token, primaryColor, welcomeMessage);

      const script = this.renderer.createElement('script');
      script.type = 'module';
      script.text = scriptContent;
      this.renderer.appendChild(this.document.body, script);
    }
  }

  private getPrimaryColor(): string {
    const style = getComputedStyle(this.document.documentElement);
    return (
      style.getPropertyValue('--color-copilot').trim() ||
      style.getPropertyValue('--color-primary').trim() ||
      style.getPropertyValue('--primary').trim() ||
      '#000000'
    );
  }
  //Willkommensnachricht
  private getWelcomeMessage(): string {
    switch (this.locale) {
      case 'de_DE':
        return 'Willkommen! Wie kann ich Ihnen heute helfen?';
      case 'fr_FR':
        return "Bienvenue! Comment puis-je vous aider aujourd'hui?";
      default:
        return 'Welcome! How can I assist you today?';
    }
  }

  private getChatbotScriptContent(
    customer: unknown,
    restEndpoint: string,
    token: string,
    primaryColor: string,
    welcomeMessage: string
  ): string {
    return `
        (async () => {
          const { default: Chatbot } = await import("${this.copilotSettings.cdnLink}");
          let latestMessages = [];
          let previousLoading = false; // Assuming initial loading state is false

          Chatbot.init({
            chatflowid: ${JSON.stringify(this.copilotSettings.chatflowid)},
            apiHost: ${JSON.stringify(this.copilotSettings.apiHost)},
            chatflowConfig: {
              vars: {
                customer: ${JSON.stringify(customer)},
                restEndpoint: ${JSON.stringify(restEndpoint)},
                locale: "${this.locale}",
                user_token: ${JSON.stringify(token)},
              },
            },
            observersConfig: {
              observeToolCall: toolCall => {
                window.handleToolCall(toolCall);
              },
              observeUserInput: (userInput) => {
                console.log({ userInput });
              },
              // The bot message stack has changed
              observeMessages: (messages) => {
                  console.log({ messages });

                  // Update the latestMessages with the new messages
                  latestMessages = messages;
              },
              // The bot loading signal changed
              observeLoading: (loading) => {
                console.log({ loading });

                // Detect transition from true to false
                if (previousLoading && !loading) {
                  if (!latestMessages?.length) {
                    console.warn('No messages available to process.');
                    return;
                  }

                  const lastMessage = latestMessages[latestMessages.length - 1];

                  if (!lastMessage.messageId) {
                    console.warn('Last message does not contain a messageId:', lastMessage);
                    return;
                  }

                  const usedTools = lastMessage.usedTools;

                  if (!usedTools?.length) {
                    console.warn('No tools found in the last message:', lastMessage);
                    return;
                  }

                  const lastTool = usedTools[usedTools.length - 1];

                  if (!lastTool) {
                    console.warn('Last tool does not have the expected structure:', lastTool);
                    return;
                  }

                  // Call the handleToolCall function with the last tool
                  document.dispatchEvent(new CustomEvent('toolCallEvent', { detail: lastTool }));

                }

                // Update previousLoading for the next change
                previousLoading = loading;
              },
            },
            theme: {
              button: {
                backgroundColor: "${primaryColor}",
                dragAndDrop: true,
              },
              chatWindow: {
                showTitle: true,
                showAgentMessages: false,
                title: ${JSON.stringify(this.copilotSettings.copilotTitle)},
                welcomeMessage: ${JSON.stringify(welcomeMessage)},
                backgroundColor: '#f8f9fa',
                height: 700,
                fontSize: '0.875rem',
                
                //hier starter Prompts 
                starterPrompts: ['What can you do for me?', 'Who are you?'],
                botMessage: {
                  backgroundColor: '#ffffff',
                },
                userMessage: {
                  backgroundColor: '${primaryColor}',
                },
                textInput: {
                  sendButtonColor: '${primaryColor}',
                  maxChars: 200,
                  maxCharsWarningMessage: 'You exceeded the characters limit. Please input less than 200 characters.',
                  autoFocus: false,
                },
                footer: {
                  textColor: '#303235',
                  text: 'uses AI |',
                  company: 'Privacy Policy',
                  companyLink: 'https://intershop.com',
                },
              },
              disclaimer: {
                title: 'Disclaimer',
                message: 'By using this chatbot, you agree to the <a target="_blank" href="https://flowiseai.com/terms">Terms & Condition</a>',
              },
            },
          });
        })();
      `;
  }
}
