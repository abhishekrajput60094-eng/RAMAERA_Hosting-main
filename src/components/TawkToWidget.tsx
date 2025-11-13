import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTawkTo } from '../hooks/useTawkTo';
import { useUserStore } from '../store/authStore';

interface TawkToWidgetProps {
  hideOnRoutes?: string[];
}

export const TawkToWidget = ({ hideOnRoutes = [] }: TawkToWidgetProps) => {
  const location = useLocation();
  const { user } = useUserStore();
  const { hideWidget, showWidget, setAttributes } = useTawkTo({
    onLoad: () => {
      console.log('Tawk.to widget loaded successfully');
    },
  });

  useEffect(() => {
    const shouldHide = hideOnRoutes.some(route => location.pathname.startsWith(route));

    if (shouldHide) {
      hideWidget();
    } else {
      showWidget();
    }
  }, [location.pathname, hideOnRoutes, hideWidget, showWidget]);

  useEffect(() => {
    if (user) {
      const attributes: Record<string, string> = {
        name: user.full_name || 'Unknown User',
        email: user.email || '',
        userId: user.id,
      };

      if (user.role) {
        attributes.role = user.role;
      }

      if (user.company_name) {
        attributes.company = user.company_name;
      }

      setAttributes(attributes);
    }
  }, [user, setAttributes]);

  return null;
};
