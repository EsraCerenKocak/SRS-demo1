import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Animated,
} from 'react-native';
import { theme } from '../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  success?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  ...rest
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedBorder = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const getBorderColor = () => {
    if (error) return theme.colors.danger;
    if (success) return theme.colors.success;
    return borderColor;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor(), borderWidth: isFocused || error || success ? 2 : 1 },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus && rest.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur && rest.onBlur(e);
          }}
          {...rest}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
  },
  inputContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius,
    ...theme.shadows.subtle,
  },
  input: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
});
