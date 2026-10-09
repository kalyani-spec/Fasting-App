import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { formatHM } from '../lib/time';
import { Button } from './Button';
import { Txt } from './Txt';

type Props = { visible: boolean; elapsedMs: number; onConfirm: () => void; onCancel: () => void };

export function EndFastSheet({ visible, elapsedMs, onConfirm, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.handle} />
        <Txt w="bold" size={22} center>
          End your fast at {formatHM(elapsedMs)}?
        </Txt>
        <Txt color={colors.muted} center>
          Every hour you did counts.
        </Txt>
        <Button title="End fast" onPress={onConfirm} />
        <Button title="Not yet" variant="outline" onPress={onCancel} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(23,35,31,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginBottom: 4 },
});
