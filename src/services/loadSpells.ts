/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import clients from './apolloClients';
import { getSpells as getSpellsQuery, getSpellsChanges } from './queries';
import { fetchSpellMetadata } from './utils/fetches';
import {
  getAssetFromParam,
  getParamName,
  getSpellStatus,
  getTermName,
  getValue,
  Status,
} from './utils/formatsFunctions';

// eslint-disable-next-line import/prefer-default-export
export const useLoadSpell = () => {
  const [spells, setSpells] = useState<Definitions.Spell[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: subgraphSpellsResponse, loading: loadingSubgraphSpells } =
    useQuery(getSpellsQuery, {
      client: clients.MakerGovernance,
    });

  const { data: changesResponse, loading: loadingChanges } = useQuery(
    getSpellsChanges,
    {
      client: clients.MakerClient,
    },
  );

  const getSpells = useCallback(async () => {
    if (
      !subgraphSpellsResponse ||
      !changesResponse ||
      !subgraphSpellsResponse?.spells ||
      !changesResponse?.changes
    ) {
      return [];
    }
    const subgraphSpells = subgraphSpellsResponse?.spells;
    const changes = changesResponse?.changes as any[] | undefined;
    const spellMetadata = await fetchSpellMetadata();

    if (
      changes?.length === 0 ||
      subgraphSpells?.length === 0 ||
      spellMetadata?.length === 0
    ) {
      return [];
    }

    const values = {} as Record<any, any>;
    const spellMap = {} as Record<any, any>;

    // eslint-disable-next-line no-restricted-syntax
    for (const change of changes || []) {
      const { id, timestamp, param, value } = change;
      if (!(timestamp in spellMap)) {
        spellMap[timestamp] = [];
      }

      const oldValueFormatted = getValue(param, values[param]);
      const newValueFormatted = getValue(param, value);

      if (
        oldValueFormatted === newValueFormatted &&
        oldValueFormatted !== undefined
      ) {
        // eslint-disable-next-line no-continue
        continue;
      }
      spellMap[timestamp].push({
        id,
        param: getParamName(param),
        term: getTermName(param),
        oldValueFormatted,
        newValueFormatted,
        value,
        asset: getAssetFromParam(param),
      });

      values[param] = value;
    }

    const metadataMap = {} as Record<any, any>;
    // eslint-disable-next-line no-restricted-syntax
    for (const metadata of spellMetadata) {
      const address = metadata.source.toLowerCase();
      metadataMap[address] = {
        ...metadata,
        // eslint-disable-next-line no-underscore-dangle
        id: metadata._id || `artificialId-${Math.random()}`,
      };
    }

    const newSpellTransactions = [
      ...(new Set(changes?.map((change) => change.txHash)) as any),
    ];
    const newSpells = newSpellTransactions?.map((txHash) => {
      const sc = changes?.filter((change) => change.txHash === txHash);
      const timestamp = sc && sc.length ? sc[0].timestamp : '';
      const spellChanges = spellMap[timestamp || ''] || [];
      return {
        id: `${timestamp.toString()}`,
        status: Status.Pending,
        address: '',
        title: '',
        created: timestamp.toString(),
        casted: timestamp.toString(),
        changes: spellChanges,
      };
    });
    newSpells.reverse();

    const latestSpell = subgraphSpells && subgraphSpells[0];
    const latestPassedSpell = subgraphSpells.filter(
      (spell: any) => spell.casted,
    )[0];

    const metadataSpells = subgraphSpells.map((subgraphSpell: any) => {
      const { id: address, timestamp: created, lifted, casted } = subgraphSpell;
      const status = getSpellStatus(
        address,
        latestSpell,
        latestPassedSpell,
        lifted,
      );
      const title = metadataMap[address] ? metadataMap[address].title : 'Spell';
      const id =
        address && metadataMap[address]
          ? metadataMap[address].id
          : `artificialId-${Math.random()}`;
      const changesMap = spellMap[casted || ''] || [];
      return {
        id,
        status,
        address,
        title,
        created,
        casted,
        changes: changesMap,
      };
    });

    const spellsLocal = [...newSpells, ...metadataSpells];

    return spellsLocal;
  }, [changesResponse, subgraphSpellsResponse]);

  const getData = useCallback(async () => {
    setLoading(true);
    const spellsGetter = await getSpells();
    setSpells(spellsGetter);
    setLoading(false);
  }, [getSpells]);

  useEffect(() => {
    getData();
  }, [changesResponse, getData, getSpells, subgraphSpellsResponse]);

  const spellSort = useMemo(
    () => spells.sort((a, b) => (a.created < b.created ? 1 : -1)),
    [spells],
  );

  return {
    spells: spellSort,
    loading: loading || loadingChanges || loadingSubgraphSpells,
  };
};
