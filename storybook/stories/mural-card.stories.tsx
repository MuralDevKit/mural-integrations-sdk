import React from 'react';
import MuralCard from '../../packages/mural-card/src/components/mural-card';

export default {
  title: 'Mural Card/Mural Card',
  component: MuralCard,
};

const onClick = () => {};

export const NormalCardLongName = () => (
  <MuralCard
    source={{
      title: 'Charcuterie Board Ideas for Thanksgiving',
      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1668793438113-6377c45eac7b04fa651588f7-d6a0cc45-7435-41cf-9d89-d52a41c41ad0.png?v=57b3d57f-55b0-4808-99ce-9e7f1b51f2da',
      details: 'Created 21 days ago \nModified 6 days, 21 hours ago',
      initials: 'AB',
    }}
    onClick={onClick}
  />
);

export const NormalCardSelected = () => (
  <MuralCard
    source={{
      title: 'Charcuterie Board Ideas for Thanksgiving',
      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1668793438113-6377c45eac7b04fa651588f7-d6a0cc45-7435-41cf-9d89-d52a41c41ad0.png?v=57b3d57f-55b0-4808-99ce-9e7f1b51f2da',
      details: 'Created 21 days ago \nModified 6 days, 21 hours ago',
      initials: 'AB',
    }}
    onClick={onClick}
    isSelected={true}
  />
);

export const DefaultThumbnailWithDetails = () => (
  <MuralCard
    source={{
      title: 'Project Retrospective',
      thumbnailUrl:
        'https://app.mural.co/static/images/mural-thumb.svg?v=1670255663027',
      details: 'Created 5 days ago \nModified 3 days, 2 hours ago',
      initials: 'BC',
    }}
    onClick={onClick}
  />
);

export const NoDetailsNoInitials = () => (
  <MuralCard
    source={{
      title: 'Onboarding Plan',
      thumbnailUrl:
        'https://app.mural.co/static/images/mural-thumb.svg?v=1670255663027',
    }}
    onClick={onClick}
  />
);

export const DarkMode = () => (
  <MuralCard
    source={{
      title: 'Project Retrospective',
      thumbnailUrl:
        'https://app.mural.co/static/images/mural-thumb.svg?v=1670255663027',
      details: 'Created 5 days ago \nModified 3 days, 2 hours ago',
      initials: 'BC',
    }}
    onClick={onClick}
    theme={'dark'}
  />
);

export const DarkModeSelected = () => (
  <MuralCard
    source={{
      title: 'Project Retrospective',
      thumbnailUrl:
        'https://app.mural.co/static/images/mural-thumb.svg?v=1670255663027',
      details: 'Created 5 days ago \nModified 3 days, 2 hours ago',
      initials: 'BC',
    }}
    onClick={onClick}
    isSelected={true}
    theme={'dark'}
  />
);

export const SmallCardHidesTheDetails = () => (
  <MuralCard
    source={{
      title: 'Charcuterie Board Ideas for Thanksgiving',
      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1668793438113-6377c45eac7b04fa651588f7-d6a0cc45-7435-41cf-9d89-d52a41c41ad0.png?v=57b3d57f-55b0-4808-99ce-9e7f1b51f2da',
      details: 'Created 21 days ago \nModified 6 days, 21 hours ago',
      initials: 'AB',
    }}
    cardSize={'small'}
    onClick={onClick}
  />
);

export const SmallCardSelected = () => (
  <MuralCard
    source={{
      title: 'Charcuterie Board Ideas for Thanksgiving',
      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1668793438113-6377c45eac7b04fa651588f7-d6a0cc45-7435-41cf-9d89-d52a41c41ad0.png?v=57b3d57f-55b0-4808-99ce-9e7f1b51f2da',
      details: 'Created 21 days ago \nModified 6 days, 21 hours ago',
      initials: 'AB',
    }}
    cardSize={'small'}
    isSelected={true}
    onClick={onClick}
  />
);

export const SmallCardDarkMode = () => (
  <MuralCard
    source={{
      title: 'Charcuterie Board Ideas for Thanksgiving',
      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1668793438113-6377c45eac7b04fa651588f7-d6a0cc45-7435-41cf-9d89-d52a41c41ad0.png?v=57b3d57f-55b0-4808-99ce-9e7f1b51f2da',
    }}
    cardSize={'small'}
    onClick={onClick}
    theme={'dark'}
  />
);

export const SmallCardDarkModeSelected = () => (
  <MuralCard
    source={{
      title: 'Charcuterie Board Ideas for Thanksgiving',
      thumbnailUrl:
        'https://murally.blob.core.windows.net/thumbnails/murally-org%2Fmurals%2Fmurally-org.1668793438113-6377c45eac7b04fa651588f7-d6a0cc45-7435-41cf-9d89-d52a41c41ad0.png?v=57b3d57f-55b0-4808-99ce-9e7f1b51f2da',
    }}
    cardSize={'small'}
    onClick={onClick}
    isSelected={true}
    theme={'dark'}
  />
);
