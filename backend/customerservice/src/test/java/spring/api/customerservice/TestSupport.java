package spring.api.customerservice;

import org.mockito.Mockito;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public final class TestSupport {

    private TestSupport() {
    }

    public static Class<?> type(String fqcn) {
        try {
            return Class.forName(fqcn);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Cannot load class: " + fqcn, e);
        }
    }

    @SuppressWarnings("unchecked")
    public static <T> T mockType(String fqcn) {
        return (T) Mockito.mock(type(fqcn));
    }

    public static Object proxy(String interfaceFqcn, InvocationHandler handler) {
        Class<?> iface = type(interfaceFqcn);
        return Proxy.newProxyInstance(
                iface.getClassLoader(),
                new Class<?>[]{iface},
                handler
        );
    }

    public static Object newInstance(String fqcn, Class<?>[] paramTypes, Object... args) {
        try {
            Constructor<?> ctor = type(fqcn).getDeclaredConstructor(paramTypes);
            ctor.setAccessible(true);
            return ctor.newInstance(args);
        } catch (Exception e) {
            throw new RuntimeException("Cannot instantiate: " + fqcn, e);
        }
    }

    public static Object invoke(Object target, String methodName, Class<?>[] paramTypes, Object... args) {
        try {
            Method method = target.getClass().getDeclaredMethod(methodName, paramTypes);
            method.setAccessible(true);
            return method.invoke(target, args);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e.getCause());
        } catch (Exception e) {
            throw new RuntimeException("Cannot invoke method: " + methodName + " on " + target.getClass(), e);
        }
    }

    public static Object getProperty(Object target, String getterName) {
        try {
            Method method = target.getClass().getMethod(getterName);
            return method.invoke(target);
        } catch (Exception e) {
            throw new RuntimeException("Cannot read property: " + getterName + " from " + target.getClass(), e);
        }
    }
}
