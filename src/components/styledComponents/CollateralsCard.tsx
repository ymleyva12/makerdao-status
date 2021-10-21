import React from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import { IconNames } from '../Icon/IconNames';
import Flex from './Flex';
import ItemCard from './ItemCard';

interface ItemProps {
  label: string;
  enframedLabel: string;
  value: string;
  selected?: boolean;
  margin?: string;
  border?: string;
  onAction: () => void;
}

interface Props {
  header: {
    iconName?: IconNames;
    title: string;
    link: string;
  };
  sections: {
    title?: string;
    items: ItemProps[];
  }[];
  margin?: string;
}

const CollateralsCard = ({
  header: { iconName, title, link },
  sections,
  margin = '',
}: Props) => (
  <CollateralsContainer margin={margin}>
    <Header>
      <FlexContainer flex="0.6">
        <Span height="30px">
          {iconName && <Icon width={30} height={30} name={iconName} />}
          <Label>{title}</Label>
        </Span>
      </FlexContainer>
      <FlexContainer flex="0.2" justifyContent="end">
        <Span>
          <Link target="_blank" href={link}>
            <Icon width={15} height={15} name="openInNewIcon" fill="#2F80ED" />
          </Link>
        </Span>
      </FlexContainer>
    </Header>
    <SectionsContainer>
      {sections.map(({ title: titleSection, items }) => (
        <div key={Math.random()}>
          {titleSection && <ItemCard isTitleSection label={titleSection} />}
          {items.map((item) => (
            <ItemCard key={Math.random()} {...item} />
          ))}
        </div>
      ))}
    </SectionsContainer>
  </CollateralsContainer>
);

const Header = styled.div`
  padding: 12px 30px 12px 30px;
  background: #d1eeeb;
  border-radius: 10px 10px 0px 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FlexContainer = styled(Flex)`
  flex: ${({ flex }: { flex?: string }) => flex || '1'};
  justify-content: ${({
    justifyContent,
  }: {
    justifyContent?: string;
    flex?: string;
  }) => justifyContent || 'start'};
`;

const CollateralsContainer = styled.div`
  margin: ${({ margin }: Partial<Props>) => margin};
  border-radius: 10px 10px 10px 10px;
  min-height: 300px;
  width: 100%;
  background-color: white;
`;

const SectionsContainer = styled.div`
  padding: 11px 30px 20px 30px;
`;

const Span = styled.span`
  display: ${({ display }: { display?: string; height?: string }) =>
    display || 'flex'};
  align-items: center;
  div {
    height: ${({ height }: { height?: string }) => height || ''};
  }
`;

const Label = styled.label`
  font-family: Roboto;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #31394d;
  margin-left: 10px;
`;

const Link = styled.a`
  background: none;
  border: none;
  div {
    height: 15px;
  }
`;

export default CollateralsCard;
