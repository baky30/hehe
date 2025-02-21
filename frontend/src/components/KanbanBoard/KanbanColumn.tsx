import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import Axios from 'axios';
import moment from 'moment';
import CardBox from '../CardBox';
import ListActionsPopover from '../ListActionsPopover';
import CardBoxModal from '../CardBoxModal';
import { AsyncThunk } from '@reduxjs/toolkit';
import Link from 'next/link';

type Props = {
  column: { id: string; label: string };
  entityName: string;
  columnFieldName: string;
  showFieldName: string;
  filtersQuery: any;
  deleteThunk: AsyncThunk<any, any, any>;
};
const perPage = 10;

const KanbanColumn = ({
  column,
  entityName,
  columnFieldName,
  showFieldName,
  filtersQuery,
  deleteThunk,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState('');
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const listInnerRef = useRef<HTMLDivElement>();
  const dispatch = useAppDispatch();

  const loadData = useCallback(
    (page: number, filters = '') => {
      const query = `?page=${page}&limit=${perPage}&field=createdAt&sort=desc&${columnFieldName}=${column.id}&${filters}`;
      setLoading(true);
      Axios.get(`${entityName}${query}`)
        .then((res) => {
          setData((prevState) =>
            page === 0 ? res.data.rows : [...prevState, ...res.data.rows],
          );
          setCount(res.data.count);
          setCurrentPage(page);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [currentUser, column],
  );

  useEffect(() => {
    if (!currentUser) return;
    loadData(0, filtersQuery);
  }, [currentUser, loadData, filtersQuery]);

  useEffect(() => {
    loadData(0, filtersQuery);
  }, [loadData, filtersQuery]);

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (Math.floor(scrollTop + clientHeight) === scrollHeight) {
        if (data.length < count && !loading) {
          loadData(currentPage + 1, filtersQuery);
        }
      }
    }
  };

  const onDeleteConfirm = () => {
    if (!itemIdToDelete) return;

    dispatch(deleteThunk(itemIdToDelete))
      .then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          setItemIdToDelete('');
          loadData(0, filtersQuery);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setItemIdToDelete('');
      });
  };

  return (
    <>
      <CardBox
        hasComponentLayout
        className={
          'w-72 rounded-md h-fit max-h-full overflow-hidden flex flex-col'
        }
      >
        <div className={'flex items-center justify-between p-3'}>
          <p className={'uppercase'}>{column.label}</p>
          <p>{count}</p>
        </div>
        <div
          ref={listInnerRef}
          className={'p-3 space-y-3 flex-1 overflow-y-auto max-h-[400px]'}
          onScroll={onScroll}
        >
          {data?.map((item) => (
            <div key={item.id} className={' rounded-md space-y-2 p-4 relative'}>
              <div className={'flex items-center justify-between'}>
                <Link
                  href={`/${entityName}/${entityName}-view/?id=${item.id}`}
                  className={'text-base font-semibold'}
                >
                  {item[showFieldName] ?? 'No data'}
                </Link>
              </div>
              <div className={'flex items-center justify-between'}>
                <p>{moment(item.createdAt).format('MMM DD hh:mm a')}</p>
                <ListActionsPopover
                  itemId={item.id}
                  pathEdit={`/${entityName}/${item.id}`}
                  pathView={`/${entityName}/${entityName}-view/?id=${item.id}`}
                  onDelete={(id) => setItemIdToDelete(id)}
                  hasUpdatePermission={true}
                  className={'w-2 h-2 text-white'}
                  iconClassName={'w-5'}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBox>
      <CardBoxModal
        title='Please confirm'
        buttonColor='info'
        buttonLabel={loading ? 'Deleting...' : 'Confirm'}
        isActive={!!itemIdToDelete}
        onConfirm={onDeleteConfirm}
        onCancel={() => setItemIdToDelete('')}
      >
        <p>Are you sure you want to delete this item?</p>
      </CardBoxModal>
    </>
  );
};

export default KanbanColumn;
