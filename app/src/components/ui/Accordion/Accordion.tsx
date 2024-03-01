import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { PlusIcon } from '@radix-ui/react-icons';
import './AccordionStyles.css';


const AccordionTrigger = React.forwardRef<HTMLButtonElement | null, Accordion.AccordionTriggerProps>(({ children, className, ...props } : Accordion.AccordionTriggerProps, forwardedRef: React.ForwardedRef<HTMLButtonElement | null>) => (
  <Accordion.Header className="AccordionHeader flex flex-col">
    <Accordion.Trigger
      className={classNames('AccordionTrigger', className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <PlusIcon className="AccordionChevron" aria-hidden />
    </Accordion.Trigger>
  </Accordion.Header>
));

const AccordionContent = React.forwardRef<HTMLDivElement | null, Accordion.AccordionContentProps>(({ children, className, ...props } : Accordion.AccordionContentProps, forwardedRef: React.ForwardedRef<HTMLDivElement | null>) => (
  <Accordion.Content
    className={classNames('AccordionContent', className)}
    {...props}
    ref={forwardedRef}
  >
    <div className="AccordionContentText">{children}</div>
  </Accordion.Content>
));

export type AccordionComponentProps = {
  title: string;
  children: any;
}

const AccordionComponent = ({ title, children  } : AccordionComponentProps) => (
    <Accordion.Root className="AccordionRoot border-y-10" type="single" defaultValue="item-1" collapsible>
      <Accordion.Item className="AccordionItem" value="item-1">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>
          {children}
        </AccordionContent>
      </Accordion.Item>
    </Accordion.Root>
  );

export default AccordionComponent;