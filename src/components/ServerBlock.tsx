import { defineComponent, PropType, ref, watch } from 'vue';
import { Battery } from '@/types/api';
import api from '@/requests/api.ts';
import { NThing, NText } from 'naive-ui';
import BatteryIcon from '@/icons/battery.svg';
import BatteryChargedIcon from '@/icons/batteryCharged.svg';

const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ cursor: 'pointer', marginLeft: '8px', verticalAlign: 'middle', opacity: 0.6 }}>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

export default defineComponent({
  props: {
    server: { type: Object as PropType<Server>, required: true },
    onEdit: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const battery = ref<Battery>();
    const error = ref('');

    const checkBattery = async () => {
      try {
        battery.value = await api.battery(props.server.host, props.server.secret);
        error.value = '';
      }
      catch (e: any) {
        error.value = e.message;
      }
    };

    watch([() => props.server.host, () => props.server.secret], () => {
      checkBattery();
    }, { immediate: true });

    return () => <NThing style={{ margin: '8px 0' }}>
      {{
        header: () => props.server.name,
        'header-extra': () =>
          <div style={{ display: 'flex', 'align-items': 'center' }}>
            {battery.value?.plugged === 'AC' ?
              <BatteryChargedIcon /> :
              <BatteryIcon />}
            {battery.value?.level}
          </div>,
        description: () => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ wordBreak: 'break-all', marginRight: '8px' }}>{props.server.host}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                props.onEdit();
              }}
              style={{ display: 'inline-flex', cursor: 'pointer' }}
            >
              <GearIcon />
            </span>
          </div>
        ),
        footer: error.value ? () => <NText type="error">{error.value}</NText> : undefined,
      }}
    </NThing>;
  },
});
