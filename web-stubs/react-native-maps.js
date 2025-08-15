import React from 'react';
import { View, Text } from 'react-native';

// Web-compatible MapView component
const MapView = React.forwardRef((props, ref) => {
  const {
    style,
    initialRegion,
    region,
    showsUserLocation,
    showsMyLocationButton,
    children,
    onRegionChange,
    onRegionChangeComplete,
    ...otherProps
  } = props;

  return (
    <View
      ref={ref}
      style={[
        {
          backgroundColor: '#E5E7EB',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        },
        style,
      ]}
      {...otherProps}
    >
      <Text style={{ color: '#6B7280', fontSize: 14 }}>
        Map View (Web Preview)
      </Text>
      {children}
    </View>
  );
});

// Web-compatible Marker component
const Marker = ({ coordinate, title, description, children, ...props }) => {
  return (
    <View
      style={{
        position: 'absolute',
        backgroundColor: '#1E40AF',
        borderRadius: 12,
        padding: 4,
        minWidth: 24,
        minHeight: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      {...props}
    >
      {children || (
        <View
          style={{
            width: 8,
            height: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
          }}
        />
      )}
    </View>
  );
};

// Web-compatible Polyline component
const Polyline = ({ coordinates, strokeColor, strokeWidth, ...props }) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}
      {...props}
    />
  );
};

// Web-compatible Polygon component
const Polygon = ({ coordinates, fillColor, strokeColor, strokeWidth, ...props }) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}
      {...props}
    />
  );
};

// Web-compatible Circle component
const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth, ...props }) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}
      {...props}
    />
  );
};

// Export all components
export default MapView;
export {
  MapView,
  Marker,
  Polyline,
  Polygon,
  Circle,
};