import React from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import classNames from 'classnames';
import { PlusIcon } from '@radix-ui/react-icons';
import './AccordionStyles.css';


const CollapsibleTrigger = React.forwardRef<HTMLButtonElement | null, Collapsible.CollapsibleTriggerProps>(({ children, className, ...props } : Collapsible.CollapsibleTriggerProps, forwardedRef: React.ForwardedRef<HTMLButtonElement | null>) => (
    <Collapsible.Trigger
      className={classNames('CollapsibleTrigger', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <PlusIcon className="CollapsibleChevron" aria-hidden />
    </Collapsible.Trigger>
));

const CollapsibleContent = React.forwardRef<HTMLDivElement | null, Collapsible.CollapsibleContentProps>(({ children, className, ...props } : Collapsible.CollapsibleContentProps, forwardedRef: React.ForwardedRef<HTMLDivElement | null>) => (
  <Collapsible.Content
    className={classNames('CollapsibleContent', className)}
    {...props}
    ref={forwardedRef}
  >
    <div className="CollapsibleContentText">{children}</div>
  </Collapsible.Content>
));

export type CollapsibleComponentProps = {
  title: string;
  children: any;
}

const AccordionComponent = ({ title, children  } : CollapsibleComponentProps) => (
    <Collapsible.Root className="CollapsibleRoot py-4 border-t-2 border-separate" defaultValue="item-1">
      <CollapsibleTrigger className={`flex justify-between items-center w-full`}>
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4">
        {children}
      </CollapsibleContent>
    </Collapsible.Root>
  );

export default AccordionComponent;